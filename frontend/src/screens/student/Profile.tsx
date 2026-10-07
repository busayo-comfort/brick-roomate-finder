import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "../../context/AuthContext";
import {
  api,
  type University,
  type Cleanliness,
  type SleepSchedule,
  type StudyHabits,
  ApiError,
} from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";
import SecuritySettings from "../../components/SecuritySettings";
import { toast } from "sonner";
import { z } from "zod";

const TAG_SUGGESTIONS = [
  "tidy",
  "non-smoker",
  "smoker",
  "quiet",
  "social",
  "early-bird",
  "night-owl",
  "student",
  "professional",
  "introvert",
  "extrovert",
  "music",
  "gaming",
  "cooking",
  "fitness",
  "reading",
  "spiritual",
  "vegetarian",
  "vegan",
  "pet-friendly",
  "no pets",
  "work from home",
  "neat",
  "organized",
  "chill",
  "outgoing",
  "studious",
  "budget-conscious",
  "security-conscious",
  "friendly",
];
const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  university: z.string().trim().min(1, "Choose your university."),
  genderPreference: z.enum(["male", "female"], { message: "Choose a gender preference." }),
  budgetMin: z.coerce.number().positive().optional().or(z.literal("")),
  budgetMax: z.coerce.number().positive().optional().or(z.literal("")),
  bio: z.string().max(400, "Bio must be 400 characters or fewer."),
});
type FormState = {
  name: string;
  university: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  genderPreference: string;
  moveInDate: string;
  bio: string;
  lifestyleTags: string[];
  tagSearch: string;
  hasApartment: boolean;
  cleanliness: string;
  sleepSchedule: string;
  studyHabits: string;
};
const initialForm: FormState = {
  name: "",
  university: "",
  location: "",
  budgetMin: "",
  budgetMax: "",
  genderPreference: "",
  moveInDate: "",
  bio: "",
  lifestyleTags: [],
  tagSearch: "",
  hasApartment: false,
  cleanliness: "",
  sleepSchedule: "",
  studyHabits: "",
};
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const CLEANLINESS_OPTIONS: { value: Cleanliness; label: string }[] = [
  { value: "very-clean", label: "Very clean" },
  { value: "average", label: "Average" },
  { value: "messy", label: "Relaxed / messy" },
];
const SLEEP_OPTIONS: { value: SleepSchedule; label: string }[] = [
  { value: "early-bird", label: "Early bird" },
  { value: "night-owl", label: "Night owl" },
  { value: "flexible", label: "Flexible" },
];
const STUDY_OPTIONS: { value: StudyHabits; label: string }[] = [
  { value: "quiet", label: "Quiet, at home" },
  { value: "group", label: "Group study" },
  { value: "library", label: "At the library" },
  { value: "any", label: "No preference" },
];

export default function Profile() {
  const {
    currentUser,
    isAuthenticated,
    authReady,
    updateProfile,
    isProfileComplete,
    completeness,
    uploadPhoto,
  } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [universities, setUniversities] = useState<University[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (authReady && !isAuthenticated) navigate("/login");
  }, [authReady, isAuthenticated, navigate]);
  useEffect(() => {
    void api
      .universities()
      .then(setUniversities)
      .catch(() => setError("Could not load universities."));
  }, []);
  useEffect(() => {
    if (currentUser)
      setForm({
        name: currentUser.name || "",
        university: currentUser.university || "",
        location: currentUser.location || "",
        budgetMin: currentUser.budgetMin?.toString() || "",
        budgetMax: currentUser.budgetMax?.toString() || "",
        genderPreference: currentUser.genderPreference || "",
        moveInDate: currentUser.moveInDate?.slice(0, 10) || "",
        bio: currentUser.bio || "",
        lifestyleTags: currentUser.lifestyleTags || [],
        tagSearch: "",
        hasApartment: currentUser.hasApartment || false,
        cleanliness: currentUser.cleanliness || "",
        sleepSchedule: currentUser.sleepSchedule || "",
        studyHabits: currentUser.studyHabits || "",
      });
  }, [currentUser]);
  const tagOptions = useMemo(
    () =>
      TAG_SUGGESTIONS.filter(
        (tag) => !form.lifestyleTags.includes(tag) && tag.includes(form.tagSearch.toLowerCase()),
      ).slice(0, 8),
    [form.lifestyleTags, form.tagSearch],
  );
  if (!authReady || !isAuthenticated || !currentUser)
    return <PageLoader label="Loading your profile" withSidebar />;
  const set = (key: keyof FormState, value: string | boolean | string[]) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const addTag = (tag: string) =>
    setForm((previous) => ({
      ...previous,
      lifestyleTags: [...previous.lifestyleTags, tag],
      tagSearch: "",
    }));
  const removeTag = (tag: string) =>
    setForm((previous) => ({
      ...previous,
      lifestyleTags: previous.lifestyleTags.filter((item) => item !== tag),
    }));
  const choosePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadPhoto(file);
      toast.success("Profile photo updated.");
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not upload that photo.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Check the form fields.";
      setError(message);
      toast.error(message);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        university: form.university,
        hasApartment: form.hasApartment,
        location: form.location.trim() || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        genderPreference: form.genderPreference as "male" | "female",
        moveInDate: form.moveInDate
          ? new Date(`${form.moveInDate}T00:00:00.000Z`).toISOString()
          : undefined,
        bio: form.bio.trim() || undefined,
        lifestyleTags: form.lifestyleTags,
        cleanliness: (form.cleanliness || undefined) as Cleanliness | undefined,
        sleepSchedule: (form.sleepSchedule || undefined) as SleepSchedule | undefined,
        studyHabits: (form.studyHabits || undefined) as StudyHabits | undefined,
      });
      toast.success("Profile saved.");
      navigate("/student/dashboard");
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not save your profile.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-600">
              Your information
            </p>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900">
              {isProfileComplete ? "Your profile" : "Complete your profile"}
            </h1>
            <p className="mt-3 text-slate-500">
              Complete your details so BRICK can personalize your matches.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-100 text-2xl font-bold text-teal-700">
                    {currentUser.image ? (
                      <img
                        src={currentUser.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (currentUser.name || currentUser.email || "B").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{currentUser.email}</p>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={uploading}
                        onChange={(event) => void choosePhoto(event)}
                      />
                      {uploading ? "Uploading…" : currentUser.image ? "Change photo" : "Add photo"}
                    </label>
                  </div>
                </div>
                <div className="sm:ml-auto sm:w-56">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Profile completeness</span>
                    <span className="text-slate-900">{completeness}%</span>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={completeness}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {completeness >= 100
                      ? "Your profile is complete."
                      : "Fill in more fields to rank higher in matches."}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Your profile information is private to your BRICK account.
              </p>
            </div>
            {error && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className={labelClass}>
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="e.g. Adaeze Okafor"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  University <span className="text-rose-500">*</span>
                </label>
                <select
                  className={inputClass}
                  value={form.university}
                  onChange={(event) => set("university", event.target.value)}
                  required
                >
                  <option value="">Select your university</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.name}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Housing situation</label>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    type="checkbox"
                    checked={form.hasApartment}
                    onChange={(event) => set("hasApartment", event.target.checked)}
                  />
                  I already have an apartment
                </label>
              </div>
              <div>
                <label className={labelClass}>Preferred area</label>
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(event) => set("location", event.target.value)}
                  placeholder="e.g. Yaba, Lagos"
                />
              </div>
              <div>
                <label className={labelClass}>Monthly budget</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    placeholder="Minimum (₦)"
                    value={form.budgetMin}
                    onChange={(event) => set("budgetMin", event.target.value)}
                  />
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    placeholder="Maximum (₦)"
                    value={form.budgetMax}
                    onChange={(event) => set("budgetMax", event.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Gender preference <span className="text-rose-500">*</span>
                </label>
                <select
                  className={inputClass}
                  value={form.genderPreference}
                  onChange={(event) => set("genderPreference", event.target.value)}
                  required
                >
                  <option value="">Select preference</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Move-in date</label>
                <input
                  className={inputClass}
                  type="date"
                  value={form.moveInDate}
                  onChange={(event) => set("moveInDate", event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Cleanliness</label>
                  <select
                    className={inputClass}
                    value={form.cleanliness}
                    onChange={(event) => set("cleanliness", event.target.value)}
                  >
                    <option value="">No preference</option>
                    {CLEANLINESS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sleep schedule</label>
                  <select
                    className={inputClass}
                    value={form.sleepSchedule}
                    onChange={(event) => set("sleepSchedule", event.target.value)}
                  >
                    <option value="">No preference</option>
                    {SLEEP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Study habits</label>
                  <select
                    className={inputClass}
                    value={form.studyHabits}
                    onChange={(event) => set("studyHabits", event.target.value)}
                  >
                    <option value="">No preference</option>
                    {STUDY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative">
                <label className={labelClass}>Lifestyle tags</label>
                <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
                  {form.lifestyleTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      {tag} ×
                    </button>
                  ))}
                  <input
                    className="min-w-[140px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
                    value={form.tagSearch}
                    onChange={(event) => set("tagSearch", event.target.value)}
                    placeholder="Search or add a tag..."
                  />
                </div>
                {form.tagSearch && tagOptions.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {tagOptions.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Choose from popular suggestions or press Enter-style by selecting a suggestion.
                </p>
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  className={inputClass}
                  rows={5}
                  maxLength={400}
                  value={form.bio}
                  onChange={(event) => set("bio", event.target.value)}
                  placeholder="Tell potential roommates about yourself"
                />
                <p className="mt-2 text-right text-xs text-slate-400">{form.bio.length}/400</p>
              </div>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>
          <SecuritySettings />
        </div>
      </main>
    </div>
  );
}
