import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Volume2, Mail } from "lucide-react"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Mic className="h-8 w-8 text-purple-400" />
              <Volume2 className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold text-white">Voxera</h1>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/20 p-4 rounded-full">
                <Mail className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">شكراً لانضمامك إلى Voxera!</CardTitle>
            <CardDescription className="text-purple-200">تحقق من بريدك الإلكتروني لتأكيد حسابك</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-purple-200">
              لقد تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك قبل تسجيل الدخول.
            </p>
            <div className="pt-4">
              <Link href="/auth/login" className="text-purple-300 hover:text-white underline underline-offset-4">
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
