import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Volume2, Users, Zap, Globe, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Mic className="h-12 w-12 text-purple-400" />
              <Volume2 className="h-6 w-6 text-blue-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-5xl font-bold text-white">Voxera</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">منصة المحادثات الصوتية التفاعلية</h2>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            انغمس في تجربة صوتية احترافية مع غرف تفاعلية مخصصة للحوار والنقاش والترفيه والبث المباشر
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4"
            >
              <Link href="/auth/signup">ابدأ الآن مجاناً</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
            >
              <Link href="/auth/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mic className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">تجربة صوتية احترافية</h3>
              <p className="text-purple-200">تحكم كامل في مصادر صوتية متعددة مع جودة استوديو على هاتفك</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">غرف متنوعة</h3>
              <p className="text-purple-200">غرف عامة ومخصصة للمحادثات والموسيقى والبودكاست والبث المباشر</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="bg-indigo-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">تفاعل مباشر</h3>
              <p className="text-purple-200">هدايا رقمية، مؤثرات صوتية، تصويت مباشر ولوحات شرف</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">أمان وخصوصية</h3>
              <p className="text-purple-200">تحكم كامل في الخصوصية مع إدارة متقدمة للمضيفين</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">ثقافة عربية</h3>
              <p className="text-purple-200">مصمم خصيصاً للثقافة العربية مع إمكانية التوسع عالمياً</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <div className="bg-pink-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">أوضاع متعددة</h3>
              <p className="text-purple-200">أوضاع صوتية مختلفة تناسب كل نوع من المحتوى والتفاعل</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">جاهز لتجربة المستقبل في المحادثات الصوتية؟</h3>
          <p className="text-purple-200 mb-8">انضم إلى آلاف المستخدمين واكتشف عالماً جديداً من التفاعل الصوتي</p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4"
          >
            <Link href="/auth/signup">ابدأ رحلتك الآن</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
