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
import { Mail, Phone, User, Calendar, Loader2, MapPin, CreditCard, Briefcase, FileText, Heart, Upload, X, Camera } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Patient } from "@/types/patient"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { patientsAPI } from "@/services/api/patients"
import { fileUploadAPI } from "@/services/api/file-upload"
import type { UserGenderID, UserGenderName } from "@/types/auth"
import { useRef } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, openSignIn, openSignUp, login } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [patientProfile, setPatientProfile] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<{
    first_name: string
    last_name: string
    phone: string
    genderId: UserGenderID | null
    birthday: string
    address: string
    cccd: string
    ethinic_group: string
    health_insurance_number: string
    occupation: string
    medical_history: string
    avatar: string | null
  }>({
    first_name: '',
    last_name: '',
    phone: '',
    genderId: null,
    birthday: '',
    address: '',
    cccd: '',
    ethinic_group: '',
    health_insurance_number: '',
    occupation: '',
    medical_history: '',
    avatar: null,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const genderOptions = useMemo<
  { id: UserGenderID; name: UserGenderName }[]
  >(() => [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
    { id: 3, name: 'Other' },
  ], [])

  useEffect(() => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role?.id !== 3) {
      router.push("/")
      return
    }

    fetchPatientProfile()
  }, [isLoggedIn, user, router])

  const fetchPatientProfile = async () => {
    try {
      setIsLoading(true)
      const profile = await patientsAPI.getMyProfile()
      if (profile) {
        setPatientProfile(profile)
        // Extract user data from nested structure
        const userData = profile.user || profile
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          genderId: (userData.gender?.id ?? null) as UserGenderID | null,
          birthday: userData.birthday ? userData.birthday.split('T')[0] : '',
          address: userData.address || "",
          cccd: userData.cccd || "",
          ethinic_group: userData.ethinic_group || "",
          health_insurance_number: profile.health_insurance_number || "",
          occupation: profile.occupation || "",
          medical_history: profile.medical_history || "",
          avatar: userData.avatar || null,
        })
        // Set avatar preview if exists
        if (userData.avatar) {
          setAvatarPreview(userData.avatar)
        }
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải thông tin hồ sơ. Vui lòng thử lại.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const currentUser = patientProfile?.user || patientProfile || user

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate image file
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, etc.)',
      })
      e.target.value = ''
      return
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > 10) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 10MB',
      })
      e.target.value = ''
      return
    }

    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setFormData(prev => ({ ...prev, avatar: null }))
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setError("")

    try {
      // Upload avatar if a new file was selected
      let avatarUrl = formData.avatar
      if (avatarFile) {
        setIsUploadingAvatar(true)
        try {
          avatarUrl = await fileUploadAPI.upload(avatarFile)
          setFormData(prev => ({ ...prev, avatar: avatarUrl }))
        } catch (uploadError: any) {
          toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: uploadError.message || 'Không thể upload avatar. Vui lòng thử lại.',
          })
          setIsUploadingAvatar(false)
          setIsSaving(false)
          return
        } finally {
          setIsUploadingAvatar(false)
        }
      }

      const updated = await patientsAPI.update({
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          gender_id: formData.genderId ? Number(formData.genderId) : null,
          birthday: formData.birthday || null,
          address: formData.address || null,
          cccd: formData.cccd || null,
          ethinic_group: formData.ethinic_group || null,
          avatar: avatarUrl,
        },
        health_insurance_number: formData.health_insurance_number || null,
        occupation: formData.occupation || null,
        medical_history: formData.medical_history || null,
      })

      if (!updated) {
        setError("Cập nhật thất bại, vui lòng thử lại.")
        return
      }

      // Update patient profile state
      setPatientProfile(updated)
      
      // Update auth context with new user data
      const updatedUser = updated.user || updated
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : ""
      login(updatedUser, token, false)

      toast({
        title: 'Thành công',
        description: 'Cập nhật thông tin hồ sơ thành công.',
      })

      setIsEditing(false)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Có lỗi xảy ra, vui lòng thử lại."
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: errorMessage,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header isLoggedIn={isLoggedIn} user={user} onLogout={logout} onSignIn={openSignIn} onSignUp={openSignUp} />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage 
                      src={avatarPreview || currentUser?.avatar || "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"} 
                      alt={currentUser?.first_name} 
                    />
                    <AvatarFallback>
                      {currentUser?.first_name?.charAt(0)}
                      {currentUser?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="rounded-full w-8 h-8 p-0"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      {(avatarPreview || avatarFile) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="rounded-full w-8 h-8 p-0 absolute -top-2 -right-2"
                          onClick={handleRemoveAvatar}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
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
                      value={formData.genderId ? String(formData.genderId) : "none"}
                      onValueChange={(v) =>
                        handleChange('genderId', v === "none" ? null : (Number(v) as UserGenderID))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not specified</SelectItem>
                        {genderOptions.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-lg text-foreground capitalize">{currentUser?.gender?.name || "Not specified"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Birthday
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleChange("birthday", e.target.value)}
                    />
                  ) : (
                    <p className="text-lg text-foreground">
                      {currentUser?.birthday 
                        ? new Date(currentUser.birthday).toLocaleDateString('vi-VN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-lg text-foreground">{currentUser?.address || "Not provided"}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    CCCD/CMND
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.cccd}
                      onChange={(e) => handleChange("cccd", e.target.value)}
                      placeholder="Enter CCCD/CMND number"
                    />
                  ) : (
                    <p className="text-lg text-foreground">{currentUser?.cccd || "Not provided"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Ethnic Group
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.ethinic_group}
                      onChange={(e) => handleChange("ethinic_group", e.target.value)}
                      placeholder="Enter ethnic group"
                    />
                  ) : (
                    <p className="text-lg text-foreground">{currentUser?.ethinic_group || "Not provided"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Health Insurance Number
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.health_insurance_number}
                    onChange={(e) => handleChange("health_insurance_number", e.target.value)}
                    placeholder="Enter health insurance number"
                  />
                ) : (
                  <p className="text-lg text-foreground">{patientProfile?.health_insurance_number || "Not provided"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Occupation
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    placeholder="Enter your occupation"
                  />
                ) : (
                  <p className="text-lg text-foreground">{patientProfile?.occupation || "Not provided"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Medical History
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.medical_history}
                    onChange={(e) => handleChange("medical_history", e.target.value)}
                    placeholder="Enter your medical history"
                    rows={4}
                  />
                ) : (
                  <p className="text-lg text-foreground whitespace-pre-wrap">
                    {patientProfile?.medical_history || "Not provided"}
                  </p>
                )}
              </div>

              {currentUser?.date_joined && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </Label>
                  <p className="text-lg text-foreground">
                    {new Date(currentUser.date_joined).toLocaleDateString("vi-VN", { 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="pt-4 border-t border-border flex gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        setError("")
                        if (patientProfile) {
                          const userData = patientProfile.user || patientProfile
                          setFormData({
                            first_name: userData.first_name || "",
                            last_name: userData.last_name || "",
                            phone: userData.phone || "",
                            genderId: (userData.gender?.id ?? null) as UserGenderID | null,
                            birthday: userData.birthday ? userData.birthday.split('T')[0] : '',
                            address: userData.address || "",
                            cccd: userData.cccd || "",
                            ethinic_group: userData.ethinic_group || "",
                            health_insurance_number: patientProfile.health_insurance_number || "",
                            occupation: patientProfile.occupation || "",
                            medical_history: patientProfile.medical_history || "",
                            avatar: userData.avatar || null,
                          })
                          // Reset avatar preview
                          setAvatarPreview(userData.avatar || null)
                          setAvatarFile(null)
                        }
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSave}
                      disabled={isSaving || isUploadingAvatar}
                    >
                      {(isSaving || isUploadingAvatar) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isUploadingAvatar ? 'Uploading Avatar...' : 'Save Changes'}
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
