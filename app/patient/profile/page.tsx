"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthContext } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, User, Calendar, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { patientsAPI } from "@/services/api/patients"
import type { UserGenderID, UserGenderName } from "@/types/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp, login } = useAuthContext()
  const [isMounted, setIsMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const [localUser, setLocalUser] = useState(user)
  const [formData, setFormData] = useState<{
    first_name: string
    last_name: string
    phone: string
    genderId: UserGenderID
  }>({
    first_name: '',
    last_name: '',
    phone: '',
    genderId: 1,
  })

  const genderOptions = useMemo<
  { id: UserGenderID; name: UserGenderName }[]
  >(() => [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Other' },
  ], [])

  useEffect(() => {
    setLocalUser(user)
  }, [user])

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role?.id !== 3) {
      router.push("/")
    }

    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        genderId: (user.gender?.id ?? 1) as UserGenderID,
      })
    }
  }, [isLoggedIn, user, router])

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setError("")

    try {
      const updated = await patientsAPI.update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        gender: {
          id: Number(formData.genderId),
          name: genderOptions.find((g) => g.id === formData.genderId)?.name || user.gender?.name,
        },
      } as any)

      if (!updated) {
        setError("Cập nhật thất bại, vui lòng thử lại.")
        return
      }

      setLocalUser((prev) => {
        if (!prev) return prev
      
        const gender = genderOptions.find(
          (g) => g.id === formData.genderId
        )
      
        return {
          ...prev,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          gender: gender ?? prev.gender,
        }
      })

      setIsEditing(false)
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isMounted) return null
  const currentUser = localUser

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.avatar || "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"} alt={user?.first_name} />
                  <AvatarFallback>
                    {currentUser?.first_name?.charAt(0)}
                    {currentUser?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Patient</p>
                <Badge className="bg-primary/20 text-primary">Active Member</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
              <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">First Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                    />
                  ) : (
                    <p className="text-lg text-foreground mt-1">{currentUser?.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                    />
                  ) : (
                    <p className="text-lg text-foreground mt-1">{currentUser?.last_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <p className="text-lg text-foreground">{currentUser?.email}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                ) : (
                  <p className="text-lg text-foreground">{currentUser?.phone || "Not provided"}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Gender
                  </Label>
                  {isEditing ? (
                    <Select
                    value={String(formData.genderId)}
                    onValueChange={(v) =>
                      handleChange('genderId', Number(v) as UserGenderID)
                    }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-lg text-foreground capitalize">{currentUser?.gender.name || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-lg text-foreground">
                    {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="pt-4 border-t border-border flex gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        setError("")
                        if (currentUser) {
                          setFormData({
                            first_name: currentUser.first_name || "",
                            last_name: currentUser.last_name || "",
                            phone: currentUser.phone || "",
                            genderId: (currentUser.gender?.id ?? 1) as UserGenderID,
                          })
                        }
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
