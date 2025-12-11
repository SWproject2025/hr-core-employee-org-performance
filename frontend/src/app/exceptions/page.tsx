"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Search, Filter, AlertTriangle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ExceptionList from "@/components/exception-list"
import ResolutionModal from "@/components/resolution-modal"
import { Button } from "@/components/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const MOCK_RUNS = [
  {
    _id: "507f1f77bcf86cd799439011",
    runId: "PR-2025-1234",
    payrollPeriodStart: "2025-01-01",
    payrollPeriodEnd: "2025-01-31",
  },
]

const MOCK_EXCEPTIONS = [
  {
    _id: "exc_1",
    employeeId: "507f1f77bcf86cd799439012",
    employeeName: "John Doe",
    employeeCode: "EMP001",
    payrollRunId: "507f1f77bcf86cd799439011",
    runId: "PR-2025-1234",
    type: "MISSING_BANK_DETAILS",
    severity: "MEDIUM",
    description: "Employee John Doe (EMP001) has missing or incomplete bank details",
    status: "open",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    _id: "exc_2",
    employeeId: "507f1f77bcf86cd799439013",
    employeeName: "Jane Smith",
    employeeCode: "EMP002",
    payrollRunId: "507f1f77bcf86cd799439011",
    runId: "PR-2025-1234",
    type: "ZERO_BASE_SALARY",
    severity: "HIGH",
    description: "Employee Jane Smith (EMP002) has zero or missing base salary",
    status: "open",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    _id: "exc_3",
    employeeId: "507f1f77bcf86cd799439014",
    employeeName: "Bob Johnson",
    employeeCode: "EMP003",
    payrollRunId: "507f1f77bcf86cd799439011",
    runId: "PR-2025-1234",
    type: "EXCESSIVE_PENALTIES",
    severity: "HIGH",
    description: "Employee Bob Johnson (EMP003) has penalties exceeding 50% of gross salary",
    status: "in-progress",
    createdAt: "2025-01-15T10:00:00Z",
  },
]

type ExceptionType =
  | "all"
  | "MISSING_BANK_DETAILS"
  | "NEGATIVE_NET_PAY"
  | "EXCESSIVE_PENALTIES"
  | "ZERO_BASE_SALARY"
  | "CALCULATION_ERROR"

type ExceptionStatus = "all" | "open" | "in-progress" | "resolved"

export default function ExceptionsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const draftIdFromUrl = searchParams.get("draftId")
  const runIdFromUrl = searchParams.get("runId")

  const [exceptions, setExceptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ExceptionType>("all")
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus>("all")
  const [runFilter, setRunFilter] = useState(runIdFromUrl || "all")
  const [runs, setRuns] = useState<any[]>([])

  // Modal
  const [selectedException, setSelectedException] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("[v0] Loading exceptions with mock data for demo")

        setRuns(MOCK_RUNS)
        setExceptions(MOCK_EXCEPTIONS)

        console.log("[v0] Loaded mock runs:", MOCK_RUNS)
        console.log("[v0] Loaded mock exceptions:", MOCK_EXCEPTIONS)

        setLoading(false)

        // Uncomment below to use real API when backend is connected
        /*
        try {
          const runsResponse = await axios.get(`${API_URL}/payroll-execution/payroll-runs`)
          const runsData = runsResponse.data || []
          setRuns(runsData)
          console.log("[v0] Runs fetched:", runsData)

          // Fetch exceptions for all runs
          const allExceptions: any[] = []
          for (const run of runsData) {
            try {
              const exceptionsResponse = await axios.get(
                `${API_URL}/payroll-execution/payroll-runs/${run._id}/exceptions`,
              )
              if (exceptionsResponse.data) {
                allExceptions.push(...exceptionsResponse.data)
              }
            } catch (err) {
              console.log("[v0] Error fetching exceptions for run:", run._id, err)
            }
          }
          setExceptions(allExceptions)
          console.log("[v0] All exceptions fetched:", allExceptions)
        } catch (err) {
          console.log("[v0] Error fetching runs:", err)
          setRuns([])
          setExceptions([])
        }
        */
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load exceptions"
        setError(message)
        console.log("[v0] Error:", message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      const matchesSearch =
        exc.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.runId?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || exc.type === typeFilter
      const matchesStatus = statusFilter === "all" || exc.status === statusFilter
      const matchesRun = runFilter === "all" || exc.payrollRunId === runFilter

      return matchesSearch && matchesType && matchesStatus && matchesRun
    })
  }, [exceptions, searchQuery, typeFilter, statusFilter, runFilter])

  const handleResolve = (exception: any) => {
    setSelectedException(exception)
    setShowModal(true)
  }

  const handleResolutionSubmit = async (resolution: any) => {
    try {
      const runId = selectedException.payrollRunId
      const employeeId = selectedException.employeeId

      console.log("[v0] Resolving exception for employee:", employeeId, "in run:", runId)

      // Mock resolution
      setExceptions((prev) =>
        prev.map((exc) =>
          exc._id === selectedException._id
            ? { ...exc, status: "resolved", resolutionNote: resolution.resolutionNote }
            : exc,
        ),
      )

      toast({
        title: "Success",
        description: "Exception resolved successfully",
      })

      setShowModal(false)
      setSelectedException(null)

      // Uncomment when backend is ready
      /*
      await axios.patch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${employeeId}/resolve`,
        {
          resolutionNote: resolution.resolutionNote || "",
        }
      )
      
      // Refetch exceptions
      const response = await axios.get(`${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions`)
      setExceptions(response.data)
      */
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resolve exception"
      console.log("[v0] Resolution error:", message)
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const stats = {
    total: exceptions.length,
    open: exceptions.filter((e) => e.status === "open").length,
    inProgress: exceptions.filter((e) => e.status === "in-progress").length,
    resolved: exceptions.filter((e) => e.status === "resolved").length,
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        {draftIdFromUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2"
            onClick={() => router.push(`/payroll/runs/${draftIdFromUrl}/draft`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Draft Review
          </Button>
        )}
        <h1 className="text-3xl font-bold">Payroll Exceptions</h1>
        <p className="text-muted-foreground mt-1">Manage and resolve payroll calculation exceptions</p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exceptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Employee name or run ID"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ExceptionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MISSING_BANK_DETAILS">Missing Bank Details</SelectItem>
                  <SelectItem value="NEGATIVE_NET_PAY">Negative Net Pay</SelectItem>
                  <SelectItem value="EXCESSIVE_PENALTIES">Excessive Penalties</SelectItem>
                  <SelectItem value="ZERO_BASE_SALARY">Zero Base Salary</SelectItem>
                  <SelectItem value="CALCULATION_ERROR">Calculation Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ExceptionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Run</label>
              <Select value={runFilter} onValueChange={setRunFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Runs</SelectItem>
                  {runs.map((run) => (
                    <SelectItem key={run._id} value={run._id}>
                      {run.runId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exception List */}
      <ExceptionList exceptions={filteredExceptions} loading={loading} onResolve={handleResolve} />

      {/* Resolution Modal */}
      {selectedException && (
        <ResolutionModal
          isOpen={showModal}
          exception={selectedException}
          onClose={() => {
            setShowModal(false)
            setSelectedException(null)
          }}
          onSubmit={handleResolutionSubmit}
        />
      )}
    </div>
  )
}
