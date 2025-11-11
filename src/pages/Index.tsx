import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Wallpaper {
  id: number
  title: string
  image_url: string
  source_type: 'built-in' | 'user-uploaded'
  author?: string
  rating: number
  download_count: number
  views: number
}

interface Comment {
  id: number
  username: string
  comment_text: string
  created_at: string
}

interface User {
  id: number
  username: string
  email: string
}

const AUTH_URL = 'https://functions.poehali.dev/7ed20eeb-42ff-4ad9-835a-7cbb7b792e85'
const WALLPAPERS_URL = 'https://functions.poehali.dev/d8e10ea9-60f6-41bb-8c84-52db3d5559e8'

const SAMPLE_WALLPAPERS: Wallpaper[] = [
  {
    id: 1,
    title: 'Abstract Gradient',
    image_url: 'https://cdn.poehali.dev/projects/ae42d029-729c-481b-aa08-d150183ddd31/files/22ee280f-8b09-4805-b3fa-87248c2f1451.jpg',
    source_type: 'built-in',
    author: 'TheMe',
    rating: 0,
    download_count: 0,
    views: 0
  },
  {
    id: 2,
    title: 'Cosmic Nebula',
    image_url: 'https://cdn.poehali.dev/projects/ae42d029-729c-481b-aa08-d150183ddd31/files/79880b85-e63c-4c3b-97a5-27ba472fa2ad.jpg',
    source_type: 'built-in',
    author: 'TheMe',
    rating: 0,
    download_count: 0,
    views: 0
  },
  {
    id: 3,
    title: 'Mountain Sunset',
    image_url: 'https://cdn.poehali.dev/projects/ae42d029-729c-481b-aa08-d150183ddd31/files/e5914642-f0d8-4be3-8f0c-90684315a031.jpg',
    source_type: 'built-in',
    author: 'TheMe',
    rating: 0,
    download_count: 0,
    views: 0
  },
  {
    id: 4,
    title: 'Abstract Gradient',
    image_url: 'https://cdn.poehali.dev/projects/ae42d029-729c-481b-aa08-d150183ddd31/files/22ee280f-8b09-4805-b3fa-87248c2f1451.jpg',
    source_type: 'built-in',
    author: 'TheMe',
    rating: 0,
    download_count: 0,
    views: 0
  },
  {
    id: 5,
    title: 'Cosmic Nebula',
    image_url: 'https://cdn.poehali.dev/projects/ae42d029-729c-481b-aa08-d150183ddd31/files/79880b85-e63c-4c3b-97a5-27ba472fa2ad.jpg',
    source_type: 'user-uploaded',
    author: 'User123',
    rating: 0,
    download_count: 0,
    views: 0
  },
  {
    id: 6,
    title: 'Mountain Sunset',
    image_url: 'https://cdn.poehali.dev/projects/ae42d029-729c-481b-aa08-d150183ddd31/files/e5914642-f0d8-4be3-8f0c-90684315a031.jpg',
    source_type: 'user-uploaded',
    author: 'PhotoPro',
    rating: 0,
    download_count: 0,
    views: 0
  }
]

const Index = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'popular' | 'gallery' | 'profile'>('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null)
  const [userRating, setUserRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(SAMPLE_WALLPAPERS)
  
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    loadWallpapers()
  }, [])

  const loadWallpapers = async () => {
    const response = await fetch(WALLPAPERS_URL)
    const data = await response.json()
    if (data.wallpapers && data.wallpapers.length > 0) {
      setWallpapers(data.wallpapers)
    }
  }
  
  const handleAuth = async () => {
    const body = authMode === 'register' 
      ? { action: 'register', ...authForm }
      : { action: 'login', username: authForm.username, password: authForm.password }
    
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setShowAuthDialog(false)
      setAuthForm({ username: '', email: '', password: '' })
      toast({ title: 'Успех!', description: authMode === 'register' ? 'Регистрация завершена' : 'Вы вошли в систему' })
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
    }
  }
  
  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast({ title: 'Вы вышли из системы' })
  }
  
  const filteredWallpapers = wallpapers.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const popularWallpapers = [...wallpapers].sort((a, b) => b.rating - a.rating).slice(0, 6)

  const handleDownload = async (wallpaper: Wallpaper) => {
    await fetch(WALLPAPERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download', wallpaper_id: wallpaper.id })
    })
    
    const link = document.createElement('a')
    link.href = wallpaper.image_url
    link.download = `${wallpaper.title}.jpg`
    link.click()
    toast({ title: 'Загрузка началась!' })
  }

  const handleRatingSubmit = async () => {
    if (userRating > 0 && selectedWallpaper) {
      if (!user) {
        toast({ title: 'Требуется авторизация', description: 'Войдите чтобы оценить', variant: 'destructive' })
        return
      }
      
      const response = await fetch(WALLPAPERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rate',
          wallpaper_id: selectedWallpaper.id,
          user_id: user.id,
          rating: userRating
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        selectedWallpaper.rating = data.avg_rating
        setUserRating(0)
        toast({ title: 'Оценка сохранена!' })
        loadWallpapers()
      }
    }
  }

  const handleCommentSubmit = async () => {
    if (newComment.trim() && selectedWallpaper) {
      if (!user) {
        toast({ title: 'Требуется авторизация', description: 'Войдите чтобы комментировать', variant: 'destructive' })
        return
      }
      
      const response = await fetch(WALLPAPERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          wallpaper_id: selectedWallpaper.id,
          user_id: user.id,
          username: user.username,
          comment_text: newComment
        })
      })
      
      if (response.ok) {
        const comment: Comment = {
          id: comments.length + 1,
          username: user.username,
          comment_text: newComment,
          created_at: new Date().toLocaleDateString('ru-RU')
        }
        setComments([comment, ...comments])
        setNewComment('')
        toast({ title: 'Комментарий добавлен!' })
      }
    }
  }

  const StarRating = ({ rating, size = 16, interactive = false }: { rating: number, size?: number, interactive?: boolean }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="Star"
            size={size}
            className={`${
              star <= (interactive ? (hoveredStar || userRating) : rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer transition-all hover:scale-110' : ''}`}
            onClick={interactive ? () => setUserRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
          />
        ))}
      </div>
    )
  }

  const WallpaperCard = ({ wallpaper }: { wallpaper: Wallpaper }) => (
    <div
      className="group relative overflow-hidden rounded-xl cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={() => setSelectedWallpaper(wallpaper)}
    >
      <img
        src={wallpaper.image_url}
        alt={wallpaper.title}
        className="w-full h-64 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg mb-1">{wallpaper.title}</h3>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <StarRating rating={wallpaper.rating} />
            <span className="font-medium">{wallpaper.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="text-xs opacity-40">
          {wallpaper.source_type === 'built-in' ? 'встроенная' : 'загруженные'}
        </Badge>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg text-xs text-white">
        <StarRating rating={wallpaper.rating} size={12} />
        <span className="font-medium">{wallpaper.rating.toFixed(1)}</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TheMe
            </h1>
            <nav className="flex gap-2 items-center">
              <Button
                variant={activeTab === 'popular' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('popular')}
              >
                <Icon name="TrendingUp" className="mr-2" size={18} />
                Популярное
              </Button>
              <Button
                variant={activeTab === 'gallery' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('gallery')}
              >
                <Icon name="Grid" className="mr-2" size={18} />
                Галерея
              </Button>
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('profile')}
              >
                <Icon name="User" className="mr-2" size={18} />
                Профиль
              </Button>
              {user ? (
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">{user.username}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Выйти
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="ml-4" onClick={() => setShowAuthDialog(true)}>
                  <Icon name="LogIn" className="mr-2" size={16} />
                  Войти
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'popular' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Популярные обои</h2>
              <p className="text-muted-foreground">Лучшие обои с высоким рейтингом</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularWallpapers.map((wallpaper) => (
                <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Поиск обоев..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWallpapers.map((wallpaper) => (
                <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Профиль</h2>
              <p className="text-muted-foreground">Настройки и публикация обоев</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Upload" size={20} />
                  Опубликовать обои
                </h3>
                <Input type="file" accept="image/*" />
                <Button className="w-full">
                  <Icon name="Upload" className="mr-2" size={18} />
                  Загрузить
                </Button>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Settings" size={20} />
                  Настройки
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Фильтры поиска</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={activeFilters.includes('popular') ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => toggleFilter('popular')}
                      >
                        Популярное
                      </Badge>
                      <Badge 
                        variant={activeFilters.includes('new') ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => toggleFilter('new')}
                      >
                        Новое
                      </Badge>
                      <Badge 
                        variant={activeFilters.includes('built-in') ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => toggleFilter('built-in')}
                      >
                        Встроенные
                      </Badge>
                      <Badge 
                        variant={activeFilters.includes('user-uploaded') ? 'default' : 'outline'} 
                        className="cursor-pointer"
                        onClick={() => toggleFilter('user-uploaded')}
                      >
                        Загруженные
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тема сайта</label>
                    <div className="flex gap-2">
                      <Button 
                        variant={theme === 'dark' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setTheme('dark')}
                      >
                        <Icon name="Moon" className="mr-2" size={16} />
                        Тёмная
                      </Button>
                      <Button 
                        variant={theme === 'light' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setTheme('light')}
                      >
                        <Icon name="Sun" className="mr-2" size={16} />
                        Светлая
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Стиль отображения</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Grid" className="mr-2" size={16} />
                        Сетка
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon name="List" className="mr-2" size={16} />
                        Список
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Dialog open={!!selectedWallpaper} onOpenChange={() => setSelectedWallpaper(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedWallpaper && (
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative bg-black">
                <img
                  src={selectedWallpaper.image_url}
                  alt={selectedWallpaper.title}
                  className="w-full h-full object-contain"
                />
                <Badge variant="secondary" className="absolute top-4 left-4 text-xs opacity-60">
                  {selectedWallpaper.source_type === 'built-in' ? 'встроенная' : 'загруженные'}
                </Badge>
              </div>
              
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle className="text-2xl">{selectedWallpaper.title}</DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>Автор: {selectedWallpaper.author}</span>
                    <span>👁 {selectedWallpaper.views}</span>
                    <span>⬇ {selectedWallpaper.download_count}</span>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6">
                  <Tabs defaultValue="actions" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="actions">Действия</TabsTrigger>
                      <TabsTrigger value="comments">Комментарии</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="actions" className="flex-1 space-y-4 mt-4">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => handleDownload(selectedWallpaper)}
                      >
                        <Icon name="Download" className="mr-2" />
                        Скачать
                      </Button>

                      <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                        <label className="text-sm font-medium block">Оценить обои</label>
                        <div className="flex items-center gap-3">
                          <StarRating rating={0} size={32} interactive />
                          {userRating > 0 && (
                            <Button onClick={handleRatingSubmit} size="sm">
                              ОК
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Текущий рейтинг:</span>
                          <StarRating rating={selectedWallpaper.rating} />
                          <span className="font-semibold">{selectedWallpaper.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="comments" className="flex-1 flex flex-col mt-4">
                      <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-secondary/50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">{comment.username}</span>
                                <span className="text-xs text-muted-foreground">{comment.created_at}</span>
                              </div>
                              <p className="text-sm">{comment.comment_text}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className="mt-4 space-y-2">
                        <Textarea
                          placeholder="Написать комментарий..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <Button onClick={handleCommentSubmit} className="w-full">
                          <Icon name="MessageSquare" className="mr-2" />
                          Прокомментировать
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Вход' : 'Регистрация'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                placeholder="username"
              />
            </div>
            {authMode === 'register' && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            )}
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <Button onClick={handleAuth} className="w-full">
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="w-full"
            >
              {authMode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Index