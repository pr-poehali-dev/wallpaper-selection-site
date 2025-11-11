'''
Business: Upload and manage wallpapers with ratings and comments
Args: event with httpMethod, body for upload/rate/comment operations
Returns: HTTP response with wallpaper data or operation result
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        cur.execute("""
            SELECT 
                w.*,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(DISTINCT r.id) as rating_count,
                COUNT(DISTINCT c.id) as comment_count
            FROM t_p23614249_wallpaper_selection_.wallpapers w
            LEFT JOIN t_p23614249_wallpaper_selection_.ratings r ON w.id = r.wallpaper_id
            LEFT JOIN t_p23614249_wallpaper_selection_.comments c ON w.id = c.wallpaper_id
            GROUP BY w.id
            ORDER BY w.created_at DESC
        """)
        wallpapers = cur.fetchall()
        
        result = []
        for w in wallpapers:
            result.append({
                'id': w['id'],
                'title': w['title'],
                'image_url': w['image_url'],
                'source_type': w['source_type'],
                'author': w['author'],
                'rating': float(w['avg_rating']),
                'download_count': w['download_count'],
                'views': w['views'],
                'rating_count': w['rating_count'],
                'comment_count': w['comment_count']
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'wallpapers': result}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'upload':
            title = body.get('title')
            image_url = body.get('image_url')
            author = body.get('author', 'Anonymous')
            
            if not title or not image_url:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing title or image_url'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO t_p23614249_wallpaper_selection_.wallpapers 
                (title, image_url, source_type, author) 
                VALUES (%s, %s, %s, %s) RETURNING id""",
                (title, image_url, 'user-uploaded', author)
            )
            wallpaper_id = cur.fetchone()['id']
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': wallpaper_id, 'message': 'Wallpaper uploaded successfully'}),
                'isBase64Encoded': False
            }
        
        elif action == 'rate':
            wallpaper_id = body.get('wallpaper_id')
            user_id = body.get('user_id', 'anonymous')
            rating = body.get('rating')
            
            if not wallpaper_id or not rating or rating < 1 or rating > 5:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid rating data'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO t_p23614249_wallpaper_selection_.ratings 
                (wallpaper_id, user_id, rating) 
                VALUES (%s, %s, %s)
                ON CONFLICT (wallpaper_id, user_id) 
                DO UPDATE SET rating = EXCLUDED.rating""",
                (wallpaper_id, str(user_id), rating)
            )
            conn.commit()
            
            cur.execute(
                "SELECT AVG(rating) as avg_rating FROM t_p23614249_wallpaper_selection_.ratings WHERE wallpaper_id = %s",
                (wallpaper_id,)
            )
            avg_rating = cur.fetchone()['avg_rating']
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Rating saved', 'avg_rating': float(avg_rating)}),
                'isBase64Encoded': False
            }
        
        elif action == 'comment':
            wallpaper_id = body.get('wallpaper_id')
            user_id = body.get('user_id', 'anonymous')
            username = body.get('username', 'Anonymous')
            comment_text = body.get('comment_text')
            
            if not wallpaper_id or not comment_text:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing wallpaper_id or comment_text'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO t_p23614249_wallpaper_selection_.comments 
                (wallpaper_id, user_id, username, comment_text) 
                VALUES (%s, %s, %s, %s) RETURNING id, created_at""",
                (wallpaper_id, str(user_id), username, comment_text)
            )
            result = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': result['id'],
                    'message': 'Comment added',
                    'created_at': result['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'download':
            wallpaper_id = body.get('wallpaper_id')
            
            if not wallpaper_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing wallpaper_id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "UPDATE t_p23614249_wallpaper_selection_.wallpapers SET download_count = download_count + 1 WHERE id = %s",
                (wallpaper_id,)
            )
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Download count updated'}),
                'isBase64Encoded': False
            }
    
    elif method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        wallpaper_id = body.get('wallpaper_id')
        
        if not wallpaper_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing wallpaper_id'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "UPDATE t_p23614249_wallpaper_selection_.wallpapers SET views = views + 1 WHERE id = %s",
            (wallpaper_id,)
        )
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'View count updated'}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
