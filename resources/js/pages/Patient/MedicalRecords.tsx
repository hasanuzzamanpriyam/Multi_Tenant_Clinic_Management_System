'use client';

import { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Pill,
  Stethoscope,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  Upload,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Plus,
  X,
  FileCheck,
  Building2,
  CalendarDays,
  Shield,
  Activity,
  HeartPulse,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string | null;
}

interface Clinic {
  id: number;
  name: string;
}

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time?: string;
  status: string;
  patient_notes?: string | null;
  doctor_notes?: string | null;
  doctor?: Doctor;
  clinic?: Clinic;
  prescriptions?: Prescription[];
}

interface Prescription {
  id: number;
  appointment_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions?: string | null;
  created_at: string;
  appointment?: Appointment;
}

interface LabResult {
  id: number;
  appointment_id?: number | null;
  patient_id: number;
  test_name: string;
  result_value?: string | null;
  reference_range?: string | null;
  units?: string | null;
  status: string;
  file_path?: string | null;
  recorded_at?: string | null;
  created_at: string;
  appointment?: Appointment;
  clinic?: Clinic;
}

interface DocumentUpload {
  id: number;
  patient_id: number;
  appointment_id?: number | null;
  original_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  category: string;
  created_at: string;
  appointment?: Appointment;
  clinic?: Clinic;
  uploader?: Doctor;
}

interface MedicalHistory {
  id: number;
  condition: string;
  diagnosis_date?: string | null;
  notes?: string | null;
  is_chronic: boolean;
}

interface Props {
  prescriptions: Prescription[];
  labResults: LabResult[];
  documents: DocumentUpload[];
  medicalHistories: MedicalHistory[];
  consultations: Appointment[];
  doctors: Doctor[];
  filters: {
    doctor_id?: string;
    category?: string;
    status?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    active_tab?: string;
  };
}

export default function MedicalRecords({
  prescriptions = [],
  labResults = [],
  documents = [],
  medicalHistories = [],
  consultations = [],
  doctors = [],
  filters = {},
}: Props) {
  // Tabs: 'prescriptions' | 'reports' | 'consultations' | 'history'
  const [activeTab, setActiveTab] = useState<string>(filters.active_tab || 'prescriptions');

  // Filter States
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(filters.doctor_id || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || 'all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedPrescriptionForPrint, setSelectedPrescriptionForPrint] = useState<{
    appointment?: Appointment;
    prescriptions: Prescription[];
  } | null>(null);
  const [selectedReportDetails, setSelectedReportDetails] = useState<LabResult | DocumentUpload | null>(null);

  // Upload Form
  const { data, setData, post, processing, errors, reset } = useForm<{
    title: string;
    category: string;
    doctor_id: string;
    test_date: string;
    notes: string;
    file: File | null;
  }>({
    title: '',
    category: 'lab_report',
    doctor_id: '',
    test_date: new Date().toISOString().split('T')[0],
    notes: '',
    file: null,
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/patient/reports/upload', {
      forceFormData: true,
      onSuccess: () => {
        setShowUploadModal(false);
        reset();
      },
    });
  };

  // Filtered Prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      // Doctor filter
      if (selectedDoctorId !== 'all') {
        const doctorId = p.appointment?.doctor?.id?.toString();
        if (doctorId !== selectedDoctorId) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const medName = p.medicine_name.toLowerCase();
        const instructions = (p.special_instructions || '').toLowerCase();
        const docName = (p.appointment?.doctor?.name || '').toLowerCase();
        if (!medName.includes(query) && !instructions.includes(query) && !docName.includes(query)) {
          return false;
        }
      }
      // Date filter
      if (dateFilter !== 'all' && p.appointment?.appointment_date) {
        const appDate = new Date(p.appointment.appointment_date);
        const now = new Date();
        if (dateFilter === '30days') {
          const past30 = new Date();
          past30.setDate(now.getDate() - 30);
          if (appDate < past30) return false;
        } else if (dateFilter === '90days') {
          const past90 = new Date();
          past90.setDate(now.getDate() - 90);
          if (appDate < past90) return false;
        } else if (dateFilter === 'year') {
          if (appDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [prescriptions, selectedDoctorId, searchQuery, dateFilter]);

  // Group Prescriptions by Appointment for easier review
  const groupedPrescriptions = useMemo(() => {
    const groups: { [key: number]: { appointment?: Appointment; items: Prescription[] } } = {};
    filteredPrescriptions.forEach((p) => {
      const appId = p.appointment_id || 0;
      if (!groups[appId]) {
        groups[appId] = {
          appointment: p.appointment,
          items: [],
        };
      }
      groups[appId].items.push(p);
    });
    return Object.values(groups);
  }, [filteredPrescriptions]);

  // Filtered Reports (Combined lab results and documents)
  const filteredReports = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'lab' | 'doc';
      title: string;
      category: string;
      doctorName: string;
      clinicName: string;
      date: string;
      status?: string;
      resultValue?: string | null;
      referenceRange?: string | null;
      fileUrl?: string | null;
      rawLab?: LabResult;
      rawDoc?: DocumentUpload;
    }> = [];

    // Add Lab Results
    labResults.forEach((lab) => {
      items.push({
        id: `lab-${lab.id}`,
        type: 'lab',
        title: lab.test_name,
        category: 'Lab Test Report',
        doctorName: lab.appointment?.doctor?.name || 'Assigned Laboratory',
        clinicName: lab.clinic?.name || 'City Medical Center',
        date: lab.recorded_at ? lab.recorded_at.split('T')[0] : lab.created_at.split('T')[0],
        status: lab.status || 'completed',
        resultValue: lab.result_value,
        referenceRange: lab.reference_range,
        fileUrl: lab.file_path,
        rawLab: lab,
      });
    });

    // Add Uploaded Documents
    documents.forEach((doc) => {
      let categoryLabel = 'Medical Record';
      if (doc.category === 'lab_report') categoryLabel = 'Diagnostic Report';
      else if (doc.category === 'prescription') categoryLabel = 'Prescription Scan';
      else if (doc.category === 'immunization') categoryLabel = 'Immunization';
      else if (doc.category === 'referral') categoryLabel = 'Doctor Referral';

      items.push({
        id: `doc-${doc.id}`,
        type: 'doc',
        title: doc.original_name,
        category: categoryLabel,
        doctorName: doc.appointment?.doctor?.name || doc.uploader?.name || 'Self Uploaded',
        clinicName: doc.clinic?.name || 'City Medical Center',
        date: doc.created_at.split('T')[0],
        status: 'verified',
        fileUrl: `/patient/documents/${doc.id}/download`,
        rawDoc: doc,
      });
    });

    // Apply Filters
    return items.filter((item) => {
      // Doctor filter
      if (selectedDoctorId !== 'all') {
        const itemDoc = item.rawLab?.appointment?.doctor?.id || item.rawDoc?.appointment?.doctor?.id;
        if (itemDoc?.toString() !== selectedDoctorId) return false;
      }
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'lab' && !item.category.toLowerCase().includes('lab') && !item.category.toLowerCase().includes('diagnostic')) return false;
        if (selectedCategory === 'prescription' && !item.category.toLowerCase().includes('prescription')) return false;
        if (selectedCategory === 'immunization' && !item.category.toLowerCase().includes('immunization')) return false;
        if (selectedCategory === 'record' && !item.category.toLowerCase().includes('record')) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDoc = item.doctorName.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchTitle && !matchDoc && !matchCat) return false;
      }
      return true;
    });
  }, [labResults, documents, selectedDoctorId, selectedCategory, searchQuery]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedDoctorId('all');
    setSearchQuery('');
    setSelectedCategory('all');
    setDateFilter('all');
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.split('T')[0];
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr.split('T')[0];
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <Head title="Medical Records & Prescriptions - ClinicPro" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
            <Shield className="h-4 w-4" />
            <span>Patient Health Hub</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medical Records & Prescriptions</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            View, track, and filter all your doctor prescriptions, diagnostic reports, and medical consultation histories in one unified portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Report</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 via-background to-background border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Prescriptions</p>
              <h3 className="text-2xl font-bold text-foreground">{prescriptions.length}</h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">From {doctors.length} Doctors</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 via-background to-background border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Diagnostic Reports</p>
              <h3 className="text-2xl font-bold text-foreground">{labResults.length + documents.length}</h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Labs & Scans</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-background border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Doctor Visits</p>
              <h3 className="text-2xl font-bold text-foreground">{consultations.length}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Consultations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 via-background to-background border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Diagnosed Conditions</p>
              <h3 className="text-2xl font-bold text-foreground">{medicalHistories.length}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Medical History</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-border/60">
        <nav className="flex space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={cn(
              'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'prescriptions'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            )}
          >
            <Pill className="h-4 w-4" />
            <span>Prescriptions & Medications</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
              {filteredPrescriptions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'reports'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Lab & Diagnostic Reports</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
              {filteredReports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={cn(
              'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'consultations'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            )}
          >
            <Stethoscope className="h-4 w-4" />
            <span>Consultation History</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
              {consultations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap',
              activeTab === 'history'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            )}
          >
            <Shield className="h-4 w-4" />
            <span>Conditions & History</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
              {medicalHistories.length}
            </span>
          </button>
        </nav>
      </div>

      {/* FILTER BAR - Applies across active tab */}
      {(activeTab === 'prescriptions' || activeTab === 'reports') && (
        <Card className="bg-card/50 border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    activeTab === 'prescriptions'
                      ? 'Search medicine, doctor, or instructions...'
                      : 'Search report title, test name, or doctor...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/80"
                />
              </div>

              {/* Filter: Doctor */}
              <div className="w-full sm:w-60">
                <Select value={selectedDoctorId} onValueChange={(val) => setSelectedDoctorId(val)}>
                  <SelectTrigger className="bg-background/80">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">👨‍⚕️ All Doctors ({doctors.length})</SelectItem>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter: Category (For Reports tab) */}
              {activeTab === 'reports' && (
                <div className="w-full sm:w-48">
                  <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
                    <SelectTrigger className="bg-background/80">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="lab">Lab & Blood Tests</SelectItem>
                      <SelectItem value="prescription">Prescription Scans</SelectItem>
                      <SelectItem value="immunization">Immunization</SelectItem>
                      <SelectItem value="record">General Records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filter: Date range (For Prescriptions tab) */}
              {activeTab === 'prescriptions' && (
                <div className="w-full sm:w-48">
                  <Select value={dateFilter} onValueChange={(val) => setDateFilter(val)}>
                    <SelectTrigger className="bg-background/80">
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 3 Months</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reset button */}
              {(selectedDoctorId !== 'all' || searchQuery !== '' || selectedCategory !== 'all' || dateFilter !== 'all') && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 1: PRESCRIPTIONS & MEDICATIONS                             */}
      {/* ============================================================== */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          {groupedPrescriptions.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Pill className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Prescriptions Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery || selectedDoctorId !== 'all'
                    ? 'No medications match your filter criteria. Try resetting the filters.'
                    : 'You do not have any prescribed medications recorded yet.'}
                </p>
                {(searchQuery || selectedDoctorId !== 'all' || dateFilter !== 'all') && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            groupedPrescriptions.map((group, idx) => {
              const appointment = group.appointment;
              const doctor = appointment?.doctor;
              const clinic = appointment?.clinic;

              return (
                <Card key={idx} className="border-border/60 overflow-hidden shadow-sm hover:shadow transition-shadow">
                  {/* Appointment Consultation Header */}
                  <div className="bg-muted/40 p-4 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {doctor?.name
                          ? doctor.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                          : 'DR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{doctor?.name || 'Consulting Physician'}</h4>
                          {doctor?.specialty && (
                            <Badge variant="outline" className="text-xs">
                              {doctor.specialty}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(appointment?.appointment_date)}
                          </span>
                          {appointment?.appointment_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {appointment.appointment_time}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {clinic?.name || 'City Medical Center'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedPrescriptionForPrint({
                            appointment,
                            prescriptions: group.items,
                          })
                        }
                        className="text-xs flex items-center gap-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print Prescription Slip
                      </Button>
                    </div>
                  </div>

                  {/* Doctor's Consultation Diagnosis/Notes if available */}
                  {appointment?.doctor_notes && (
                    <div className="px-4 py-2.5 bg-blue-50/50 dark:bg-blue-950/20 border-b border-border/30 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Doctor Clinical Notes: </span>
                        <span>{appointment.doctor_notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Medicines List in this consultation */}
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((rx) => (
                        <div
                          key={rx.id}
                          className="p-3.5 rounded-lg border border-border/60 bg-background/50 hover:border-primary/40 transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                <Pill className="h-4 w-4" />
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-foreground">{rx.medicine_name}</h5>
                                <span className="text-xs font-semibold text-primary">{rx.dosage}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[11px] font-medium">
                              {rx.duration}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/30">
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Frequency</span>
                              <span className="font-medium text-foreground">{rx.frequency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Duration</span>
                              <span className="font-medium text-foreground">{rx.duration}</span>
                            </div>
                          </div>

                          {rx.special_instructions && (
                            <div className="p-2 rounded bg-muted/60 text-xs text-muted-foreground mt-1.5">
                              <span className="font-semibold text-foreground">Directions: </span>
                              {rx.special_instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LAB & DIAGNOSTIC REPORTS                                */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Diagnostic Reports Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery || selectedCategory !== 'all' || selectedDoctorId !== 'all'
                    ? 'No reports match your filters. Try resetting the filters.'
                    : 'You do not have any diagnostic reports recorded yet.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button size="sm" onClick={() => setShowUploadModal(true)}>
                    <Upload className="h-4 w-4 mr-1.5" /> Upload Report
                  </Button>
                  {(searchQuery || selectedCategory !== 'all' || selectedDoctorId !== 'all') && (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {report.type === 'lab' ? <Activity className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <Badge
                        variant={report.type === 'lab' ? 'default' : 'secondary'}
                        className="text-[11px] uppercase tracking-wider font-semibold"
                      >
                        {report.category}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground mt-3 line-clamp-2">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1.5 pt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(report.date)}</span>
                      <span>•</span>
                      <span>{report.doctorName}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-2 text-xs">
                    {report.resultValue && (
                      <div className="p-2.5 rounded bg-muted/50 border border-border/30 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Key Findings / Result</span>
                        <p className="font-medium text-foreground line-clamp-2">{report.resultValue}</p>
                        {report.referenceRange && (
                          <p className="text-[11px] text-muted-foreground">Range: {report.referenceRange}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>Status: <strong className="capitalize text-emerald-600 dark:text-emerald-400">{report.status}</strong></span>
                      <span>{report.clinicName}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 border-t border-border/30 flex items-center justify-between gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReportDetails(report.rawLab || report.rawDoc || null)}
                      className="text-xs flex items-center gap-1.5 flex-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>

                    {report.fileUrl && (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CONSULTATION HISTORY                                    */}
      {/* ============================================================== */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-sm text-muted-foreground">No doctor consultation visits found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {consultations.map((app) => (
                <Card key={app.id} className="border-border/60 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base text-foreground">{app.doctor?.name || 'Physician'}</h4>
                          <Badge variant="outline" className="capitalize text-xs">
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(app.appointment_date)}</span>
                          {app.appointment_time && <span>at {app.appointment_time}</span>}
                          <span>•</span>
                          <span>{app.clinic?.name || 'City Medical Center'}</span>
                        </p>
                        {app.patient_notes && (
                          <p className="text-xs text-muted-foreground pt-1">
                            <strong>Reason: </strong> {app.patient_notes}
                          </p>
                        )}
                        {app.doctor_notes && (
                          <p className="text-xs text-foreground bg-muted/40 p-2 rounded mt-1">
                            <strong>Doctor Clinical Notes: </strong> {app.doctor_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {app.prescriptions && app.prescriptions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPrescriptionForPrint({
                              appointment: app,
                              prescriptions: app.prescriptions || [],
                            });
                          }}
                          className="text-xs flex items-center gap-1.5"
                        >
                          <Pill className="h-3.5 w-3.5 text-primary" />
                          View Rx ({app.prescriptions.length})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: MEDICAL CONDITIONS & HISTORY                           */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicalHistories.length === 0 ? (
              <Card className="col-span-2 text-center py-12">
                <CardContent>
                  <p className="text-sm text-muted-foreground">No medical conditions or chronic diseases recorded.</p>
                </CardContent>
              </Card>
            ) : (
              medicalHistories.map((hist) => (
                <Card key={hist.id} className="border-border/60">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-base">{hist.condition}</h4>
                      <Badge variant={hist.is_chronic ? 'destructive' : 'secondary'} className="text-xs">
                        {hist.is_chronic ? 'Chronic Condition' : 'Resolved / Acute'}
                      </Badge>
                    </div>
                    {hist.diagnosis_date && (
                      <CardDescription className="text-xs flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Diagnosed on {formatDate(hist.diagnosis_date)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
                    {hist.notes ? (
                      <p>{hist.notes}</p>
                    ) : (
                      <p className="italic">No specific clinical notes recorded.</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: UPLOAD EXTERNAL REPORT                                */}
      {/* ============================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-background border-border shadow-2xl animate-in fade-in-50 zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <div>
                <CardTitle className="text-lg font-bold">Upload Medical Report</CardTitle>
                <CardDescription className="text-xs">
                  Upload external lab test results, imaging reports, or doctor prescriptions.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploadModal(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <form onSubmit={handleUploadSubmit}>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Report Title / Test Name *
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. CBC Blood Test Report, MRI Brain Scan"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-semibold">
                      Category *
                    </Label>
                    <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab_report">Lab Report / Blood Test</SelectItem>
                        <SelectItem value="prescription">Prescription Scan</SelectItem>
                        <SelectItem value="medical_record">Medical Summary</SelectItem>
                        <SelectItem value="immunization">Immunization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="test_date" className="text-xs font-semibold">
                      Date of Test / Report
                    </Label>
                    <Input
                      id="test_date"
                      type="date"
                      value={data.test_date}
                      onChange={(e) => setData('test_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doctor_id" className="text-xs font-semibold">
                    Associated Doctor (Optional)
                  </Label>
                  <Select
                    value={data.doctor_id || 'none'}
                    onValueChange={(val) => setData('doctor_id', val === 'none' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor if applicable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">External / Unassigned</SelectItem>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          {doc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="file" className="text-xs font-semibold">
                    Document File (PDF, PNG, JPG - max 10MB) *
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                  />
                  {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold">
                    Notes / Description (Optional)
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Any comments, doctor advice, or remarks..."
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing} className="flex items-center gap-1.5">
                  {processing ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Report</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: PRINTABLE PRESCRIPTION SLIP                           */}
      {/* ============================================================== */}
      {selectedPrescriptionForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden my-8">
            {/* Action Bar (hidden during browser print) */}
            <div className="bg-gray-100 p-3.5 border-b border-gray-200 flex items-center justify-between print:hidden">
              <span className="font-semibold text-xs text-gray-700 flex items-center gap-1.5">
                <Printer className="h-4 w-4 text-blue-600" /> Official Prescription Preview
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPrescriptionForPrint(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Printable Prescription Body */}
            <div className="p-8 space-y-6 font-sans">
              {/* Clinic & Doctor Header */}
              <div className="border-b-2 border-blue-600 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">
                    {selectedPrescriptionForPrint.appointment?.clinic?.name || 'City Medical Center'}
                  </h2>
                  <p className="text-xs text-gray-600">Multispecialty Healthcare & Outpatient Clinic</p>
                  <p className="text-xs text-gray-500">Phone: +1 (555) 300-0001 • Web: www.clinicpro.com</p>
                </div>
                <div className="text-right">
                  <h3 className="text-base font-bold text-gray-800">
                    {selectedPrescriptionForPrint.appointment?.doctor?.name || 'Dr. Attending Physician'}
                  </h3>
                  <p className="text-xs text-blue-700 font-medium">
                    {selectedPrescriptionForPrint.appointment?.doctor?.specialty || 'General Practitioner'}
                  </p>
                  <p className="text-xs text-gray-500">Reg. No: MED-884920</p>
                </div>
              </div>

              {/* Patient Details & Date */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <p>
                    <strong className="text-gray-700">Patient Name:</strong> John Smith
                  </p>
                  <p className="pt-0.5">
                    <strong className="text-gray-700">Age / Gender:</strong> 35 Yrs / Male
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <strong className="text-gray-700">Date:</strong>{' '}
                    {formatDate(selectedPrescriptionForPrint.appointment?.appointment_date)}
                  </p>
                  <p className="pt-0.5">
                    <strong className="text-gray-700">Prescription ID:</strong>{' '}
                    RX-{selectedPrescriptionForPrint.appointment?.id || '101'}-
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {/* Rx Symbol */}
              <div className="text-2xl font-serif font-black text-blue-700 select-none">℞</div>

              {/* Medicines Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-700 uppercase font-bold text-[10px]">
                    <th className="py-2">#</th>
                    <th className="py-2">Medicine / Strength</th>
                    <th className="py-2">Dosage & Frequency</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedPrescriptionForPrint.prescriptions.map((p, i) => (
                    <tr key={p.id}>
                      <td className="py-3 font-semibold text-gray-500">{i + 1}.</td>
                      <td className="py-3">
                        <strong className="text-gray-900 block font-bold text-sm">{p.medicine_name}</strong>
                        <span className="text-blue-600 font-semibold">{p.dosage}</span>
                      </td>
                      <td className="py-3 font-medium text-gray-800">{p.frequency}</td>
                      <td className="py-3 font-medium text-gray-800">{p.duration}</td>
                      <td className="py-3 text-gray-600">{p.special_instructions || 'As directed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Doctor's Advice & Signature */}
              <div className="pt-8 border-t border-gray-200 flex items-end justify-between">
                <div className="text-xs text-gray-600 max-w-xs space-y-1">
                  <p className="font-semibold text-gray-800">Advice & Follow-up:</p>
                  <p>• Complete the prescribed antibiotic/medication course.</p>
                  <p>• Return for follow-up visit if symptoms persist.</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 w-44 pb-1 mb-1 italic text-blue-900 font-serif">
                    {selectedPrescriptionForPrint.appointment?.doctor?.name || 'Dr. Physician'}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Physician Signature & Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REPORT DETAILS MODAL                                  */}
      {/* ============================================================== */}
      {selectedReportDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-background border-border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold">Report Details</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedReportDetails(null)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Title</span>
                <p className="font-bold text-foreground text-sm">
                  {'test_name' in selectedReportDetails
                    ? selectedReportDetails.test_name
                    : selectedReportDetails.original_name}
                </p>
              </div>

              {'result_value' in selectedReportDetails && selectedReportDetails.result_value && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Findings / Result</span>
                  <p className="font-medium text-foreground">{selectedReportDetails.result_value}</p>
                  {selectedReportDetails.reference_range && (
                    <p className="text-muted-foreground pt-1">
                      <strong>Normal Reference Range:</strong> {selectedReportDetails.reference_range}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Date</span>
                  <p className="font-medium text-foreground">
                    {'recorded_at' in selectedReportDetails && selectedReportDetails.recorded_at
                      ? selectedReportDetails.recorded_at.split('T')[0]
                      : selectedReportDetails.created_at.split('T')[0]}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Status</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {'status' in selectedReportDetails ? selectedReportDetails.status : 'Verified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 pt-3 flex justify-end">
              <Button size="sm" onClick={() => setSelectedReportDetails(null)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
