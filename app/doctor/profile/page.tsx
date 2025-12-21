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
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Loader2, 
  Upload, 
  X, 
  FileText,
  Stethoscope,
  DollarSign,
  Award,
  Briefcase
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doctorsApi } from "@/services/api/doctors"
import { specialitiesAPI, Speciality } from "@/services/api/specialities"
import { fileUploadAPI } from "@/services/api/file-upload"
import { useToast } from "@/hooks/use-toast"
import { Doctor } from "@/types/doctor"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, login } = useAuthContext()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [error, setError] = useState("")
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null)
  const [specialities, setSpecialities] = useState<Speciality[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [credentialFile, setCredentialFile] = useState<File | null>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  
  const [formData, setFormData] = useState({
    // Personal information
    first_name: "",
    last_name: "",
    phone: "",
    genderId: "1",
    avatar: "",
    
    // Professional information
    specialty: "",
    experience: "",
    price: "",
    medicalLicenseUrl: "",
    bio: "",
  })

  const genderOptions = useMemo(
    () => [
      { id: "1", name: "Male" },
      { id: "2", name: "Female" },
      { id: "3", name: "Other" },
    ],
    []
  )

  // Load doctor profile and specialities
  useEffect(() => {
    const loadData = async () => {
    setIsMounted(true)

    if (!isLoggedIn || user?.role.id !== 2) {
      router.push("/")
        return
      }

      try {
        setIsLoadingProfile(true)
        
        // Load specialities
        const specialitiesData = await specialitiesAPI.getAll()
        setSpecialities(specialitiesData)

        // Load doctor profile
        const profile = await doctorsApi.getMyProfile()
        if (profile) {
          setDoctorProfile(profile)
          setFormData({
            first_name: profile.user?.first_name || user?.first_name || "",
            last_name: profile.user?.last_name || user?.last_name || "",
            phone: profile.user?.phone || user?.phone || "",
            genderId: String(user?.gender?.id ?? "1"),
            avatar: profile.user?.avatar || user?.avatar || "",
            specialty: profile.specialty?.toString() || "",
            experience: profile.experience?.toString() || "",
            price: profile.price?.toString() || "",
            medicalLicenseUrl: profile.credentiaUrl || "",
            bio: profile.description || "",
          })
          if (profile.user?.avatar || user?.avatar) {
            setAvatarPreview(profile.user?.avatar || user?.avatar || null)
          }
        } else {
          // If no profile exists, use user data
      setFormData({
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            phone: user?.phone || "",
            genderId: String(user?.gender?.id ?? "1"),
            avatar: user?.avatar || "",
            specialty: "",
            experience: "",
            price: "",
            medicalLicenseUrl: "",
            bio: "",
          })
          if (user?.avatar) {
            setAvatarPreview(user.avatar)
          }
        }
      } catch (err: any) {
        console.error("Error loading profile:", err)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin profile. Vui lòng thử lại sau.",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadData()
  }, [isLoggedIn, user, router, toast])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, etc.)',
      })
      e.target.value = ''
      return
    }

    const fileSizeMB = fileUploadAPI.getFileSizeMB(file)
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
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(formData.avatar || null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!fileUploadAPI.isDocumentFile(file)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file tài liệu (PDF, DOC, DOCX, JPG, PNG, etc.)',
      })
      e.target.value = ''
      return
    }

    const fileSizeMB = fileUploadAPI.getFileSizeMB(file)
    if (fileSizeMB > 10) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 10MB',
      })
      e.target.value = ''
      return
    }

    setCredentialFile(file)
    setFormData(prev => ({ ...prev, medicalLicenseUrl: '' }))
  }

  const handleRemoveFile = () => {
    setCredentialFile(null)
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setError("")

    try {
      // Step 1: Upload avatar if provided
      let avatarUrl: string | null = formData.avatar || null
      
      if (avatarFile) {
        setIsUploadingFile(true)
        try {
          avatarUrl = await fileUploadAPI.upload(avatarFile)
        } catch (uploadError: any) {
          setIsUploadingFile(false)
          toast({
            variant: 'destructive',
            title: 'Lỗi tải lên avatar',
            description: uploadError.message || 'Không thể tải lên avatar. Vui lòng thử lại.',
          })
          setIsSaving(false)
          return
        } finally {
          setIsUploadingFile(false)
        }
      }

      // Step 2: Upload credential file if provided
      let medicalLicenseUrl: string | null = formData.medicalLicenseUrl || null
      
      if (credentialFile) {
        setIsUploadingFile(true)
        try {
          medicalLicenseUrl = await fileUploadAPI.upload(credentialFile)
        } catch (uploadError: any) {
          setIsUploadingFile(false)
          toast({
            variant: 'destructive',
            title: 'Lỗi tải lên file',
            description: uploadError.message || 'Không thể tải lên file. Vui lòng thử lại.',
          })
          setIsSaving(false)
          return
        } finally {
          setIsUploadingFile(false)
        }
      } else if (formData.medicalLicenseUrl) {
        medicalLicenseUrl = formData.medicalLicenseUrl.trim()
      }

      // Step 3: Update profile
      const updated = await doctorsApi.updateMyProfile({
        user: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone.trim(),
          gender_id: Number(formData.genderId),
          avatar: avatarUrl,
        },
        specialty: formData.specialty ? Number(formData.specialty) : null,
        price: formData.price ? Number(formData.price) : undefined,
        experience: formData.experience ? Number(formData.experience) : null,
        credentiaUrl: medicalLicenseUrl,
        description: formData.bio?.trim() || null,
      })

      if (!updated) {
        setError("Cập nhật thất bại, vui lòng thử lại.")
        return
      }

      // Reload profile from server to get the latest data
      try {
        const reloadedProfile = await doctorsApi.getMyProfile()
        if (reloadedProfile) {
          setDoctorProfile(reloadedProfile)
          
          // Update formData with fresh data from server
          setFormData({
            first_name: reloadedProfile.user?.first_name || user?.first_name || "",
            last_name: reloadedProfile.user?.last_name || user?.last_name || "",
            phone: reloadedProfile.user?.phone || user?.phone || "",
            genderId: String(user?.gender?.id ?? "1"),
            avatar: reloadedProfile.user?.avatar || user?.avatar || "",
            specialty: reloadedProfile.specialty?.toString() || "",
            experience: reloadedProfile.experience?.toString() || "",
            price: reloadedProfile.price?.toString() || "",
            medicalLicenseUrl: reloadedProfile.credentiaUrl || "",
            bio: reloadedProfile.description || "",
          })
          
          // Update avatar preview
          if (reloadedProfile.user?.avatar || user?.avatar) {
            setAvatarPreview(reloadedProfile.user?.avatar || user?.avatar || null)
          }
        }
      } catch (reloadError) {
        console.error("Error reloading profile:", reloadError)
        // Still update with the response data if reload fails
        setDoctorProfile(updated)
        setFormData(prev => ({
          ...prev,
          first_name: updated.user?.first_name || prev.first_name,
          last_name: updated.user?.last_name || prev.last_name,
          phone: updated.user?.phone || prev.phone,
          avatar: updated.user?.avatar || avatarUrl || prev.avatar,
          specialty: updated.specialty?.toString() || prev.specialty,
          experience: updated.experience?.toString() || prev.experience,
          price: updated.price?.toString() || prev.price,
          medicalLicenseUrl: updated.credentiaUrl || prev.medicalLicenseUrl,
          bio: updated.description || prev.bio,
        }))
        if (updated.user?.avatar || avatarUrl) {
          setAvatarPreview(updated.user?.avatar || avatarUrl || null)
        }
      }

      // Clear file uploads
      setAvatarFile(null)
      setCredentialFile(null)

      // Update auth context
      // The updated doctor has a user object, but we need to ensure it has all required fields
      const updatedUser = updated.user ? {
        ...updated.user,
        id: user?.id || updated.user.username,
        gender: user?.gender || null,
      } : user
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : ""
      toast({
        title: 'Thành công',
        description: 'Cập nhật profile thành công!',
      })

      setIsEditing(false)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.")
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Có lỗi xảy ra khi cập nhật profile.",
      })
    } finally {
      setIsSaving(false)
      setIsUploadingFile(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError("")
    setAvatarFile(null)
    setCredentialFile(null)
    
    if (doctorProfile) {
      setFormData({
        first_name: doctorProfile.user?.first_name || user?.first_name || "",
        last_name: doctorProfile.user?.last_name || user?.last_name || "",
        phone: doctorProfile.user?.phone || user?.phone || "",
        genderId: String(user?.gender?.id ?? "1"),
        avatar: doctorProfile.user?.avatar || user?.avatar || "",
        specialty: doctorProfile.specialty?.toString() || "",
        experience: doctorProfile.experience?.toString() || "",
        price: doctorProfile.price?.toString() || "",
        medicalLicenseUrl: doctorProfile.credentiaUrl || "",
        bio: doctorProfile.description || "",
      })
      setAvatarPreview(doctorProfile.user?.avatar || user?.avatar || null)
    } else if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        genderId: String(user.gender?.id ?? "1"),
        avatar: user.avatar || "",
        specialty: "",
        experience: "",
        price: "",
        medicalLicenseUrl: "",
        bio: "",
      })
      setAvatarPreview(user.avatar || null)
    }
  }

  if (!isMounted || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const displayUser = doctorProfile?.user || user
  const displaySpecialty = specialities.find(s => s.id === Number(formData.specialty))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal and professional information</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={avatarPreview || displayUser?.avatar || "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"} alt={displayUser?.first_name} />
                  <AvatarFallback>
                    {displayUser?.first_name?.charAt(0)}
                    {displayUser?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {displayUser?.first_name} {displayUser?.last_name}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">Doctor</p>
                {displaySpecialty && (
                  <Badge className="bg-primary/20 text-primary mb-4">
                    {displaySpecialty.name}
                  </Badge>
                )}
                {doctorProfile?.verificationStatus && (
                  <Badge 
                    className={
                      doctorProfile.verificationStatus === "VERIFIED" 
                        ? "bg-green-500/20 text-green-600" 
                        : doctorProfile.verificationStatus === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-red-500/20 text-red-600"
                    }
                  >
                    {doctorProfile.verificationStatus}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              <CardDescription>Your account details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label>Ảnh đại diện</Label>
                  {isEditing ? (
                    <>
                      {!avatarPreview ? (
                        <div className="flex items-center gap-4">
                          <label
                            htmlFor="avatarFile"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click để tải lên</span> hoặc kéo thả
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG (Tối đa 10MB)
                              </p>
                            </div>
                            <input
                              id="avatarFile"
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={handleAvatarChange}
                              disabled={isSaving || isUploadingFile}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{avatarFile?.name || "Current avatar"}</p>
                            {avatarFile && (
                              <p className="text-xs text-muted-foreground">
                                {(avatarFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveAvatar}
                            disabled={isSaving || isUploadingFile}
                            className="flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Tùy chọn: Ảnh đại diện sẽ hiển thị trên hồ sơ của bạn
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={displayUser?.avatar || ""} alt={displayUser?.first_name} />
                        <AvatarFallback>
                          {displayUser?.first_name?.charAt(0)}
                          {displayUser?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground">Ảnh đại diện hiện tại</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name <span className="text-destructive">*</span></Label>
                    {isEditing ? (
                      <Input
                        value={formData.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                        disabled={isSaving}
                    />
                  ) : (
                      <p className="text-lg text-foreground mt-1">{displayUser?.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                    <Label>Last Name <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                        disabled={isSaving}
                    />
                  ) : (
                      <p className="text-lg text-foreground mt-1">{displayUser?.last_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                  <p className="text-lg text-foreground">{displayUser?.email}</p>
                  <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
              </div>

              <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                    Phone Number <span className="text-destructive">*</span>
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={isSaving}
                  />
                ) : (
                    <p className="text-lg text-foreground">{displayUser?.phone || "Not provided"}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Gender
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.genderId}
                      onValueChange={(v) => handleChange("genderId", v)}
                        disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                      <p className="text-lg text-foreground capitalize">
                      {(displayUser && 'gender' in displayUser && displayUser.gender?.name) || 
                       (user?.gender?.name) || 
                       "Not specified"}
                    </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </Label>
                    <p className="text-lg text-foreground">
                      {displayUser?.date_joined 
                        ? new Date(displayUser.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your professional details and credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>
                    Specialty <span className="text-destructive">*</span>
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.specialty}
                      onValueChange={(v) => handleChange("specialty", v)}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialities.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-lg text-foreground">
                      {displaySpecialty?.name || "Not specified"}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Years of Experience
                    </Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        placeholder="5"
                        value={formData.experience}
                        onChange={(e) => handleChange("experience", e.target.value)}
                        disabled={isSaving}
                        min="0"
                      />
                    ) : (
                      <p className="text-lg text-foreground">
                        {doctorProfile?.experience ? `${doctorProfile.experience} years` : "Not specified"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Consultation Fee (VNĐ) <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        placeholder="500000"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        disabled={isSaving}
                        min="0"
                      />
                    ) : (
                      <p className="text-lg text-foreground">
                        {doctorProfile?.price 
                          ? new Intl.NumberFormat('vi-VN').format(doctorProfile.price) + " VNĐ"
                          : "Not specified"
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Medical License / Certificate</Label>
                  {isEditing ? (
                    <>
                      {!credentialFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <label
                              htmlFor="credentialFile"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                                </p>
                              </div>
                              <input
                                id="credentialFile"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                onChange={handleFileChange}
                                disabled={isSaving || isUploadingFile}
                              />
                            </label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Or enter URL directly:
                          </p>
                          <Input
                            type="url"
                            placeholder="https://example.com/license.pdf"
                            value={formData.medicalLicenseUrl}
                            onChange={(e) => handleChange("medicalLicenseUrl", e.target.value)}
                            disabled={isSaving || isUploadingFile || !!credentialFile}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                          <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{credentialFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(credentialFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            disabled={isSaving || isUploadingFile}
                            className="flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                <div>
                      {doctorProfile?.credentiaUrl ? (
                        <a
                          href={doctorProfile.credentiaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Medical License
                        </a>
                      ) : (
                        <p className="text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Bio / Professional Summary</Label>
                  {isEditing ? (
                    <Textarea
                      placeholder="Tell us about your professional background, expertise, and achievements..."
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      disabled={isSaving}
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-lg text-foreground whitespace-pre-wrap">
                      {doctorProfile?.description || "Not provided"}
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-sm text-muted-foreground">
                      Optional: A brief introduction about yourself
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error and Actions */}
            {error && (
              <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving || isUploadingFile}
                    className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                    className="bg-primary hover:bg-primary/90 flex-1"
                      onClick={handleSave}
                    disabled={isSaving || isUploadingFile}
                    >
                    {(isSaving || isUploadingFile) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isUploadingFile ? "Uploading..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsEditing(true)}
                >
                    Edit Profile
                  </Button>
                )}
              </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
