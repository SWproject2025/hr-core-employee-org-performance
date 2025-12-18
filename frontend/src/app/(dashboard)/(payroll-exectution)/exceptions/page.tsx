"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/calc-draft-ui/card"
import { Input } from "@/components/calc-draft-ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/calc-draft-ui/select"
import { Search, Filter, AlertTriangle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ExceptionList from "@/components/calc-draft-components/exception-list"
import ResolutionModal from "@/components/calc-draft-components/resolution-modal"
import { Button } from "@/components/calc-draft-ui/button" 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

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

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ExceptionType>("all")
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus>("all")
  const [runFilter, setRunFilter] = useState(runIdFromUrl || "all")
  const [runs, setRuns] = useState<any[]>([])

  const [selectedException, setSelectedException] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  // Helper functions to infer exception details from text
  const inferExceptionType = (exceptionText: string): string => {
    const text = exceptionText?.toLowerCase() || ''
    if (text.includes('bank')) return 'MISSING_BANK_DETAILS'
    if (text.includes('negative')) return 'NEGATIVE_NET_PAY'
    if (text.includes('penalties') || text.includes('penalty')) return 'EXCESSIVE_PENALTIES'
    if (text.includes('zero') && text.includes('salary')) return 'ZERO_BASE_SALARY'
    return 'CALCULATION_ERROR'
  }

  const inferExceptionStatus = (exceptionText: string): ExceptionStatus => {
    const text = exceptionText?.toLowerCase() || ''
    if (text.includes('resolved')) return 'resolved'
    if (text.includes('in progress') || text.includes('investigating')) return 'in-progress'
    return 'open'
  }

  const extractResolutionNote = (exceptionText: string): string | undefined => {
    if (!exceptionText) return undefined
    const match = exceptionText.match(/RESOLVED:\s*(.+)$/i)
    return match ? match[1].trim() : undefined
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all payroll runs
        const runsResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs`)
        let runsData: any[] = []
        if (runsResponse.ok) {
          runsData = await runsResponse.json()
          if (!Array.isArray(runsData)) {
            runsData = []
          }
        }
        setRuns(runsData)

        // Fetch exceptions for all runs
        const allExceptions: any[] = []
        if (runsData.length > 0) {
          for (const run of runsData) {
            try {
              const exceptionsResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${run._id}/exceptions`)
              if (exceptionsResponse.ok) {
                const data = await exceptionsResponse.json()
                
                // Backend returns { runId, count, exceptions: [...] }
                if (data.exceptions && Array.isArray(data.exceptions)) {
                  const formattedExceptions = data.exceptions.map((exc: any) => {
                    const employee = exc.employee || {}
                    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown'
                    
                    return {
                      _id: employee._id || `${run._id}-${Math.random()}`,
                      employeeId: employee._id || '',
                      employeeName: employeeName,
                      payrollRunId: run._id,
                      runId: run.runId || run._id,
                      type: inferExceptionType(exc.exception),
                      exception: exc.exception || '',
                      status: inferExceptionStatus(exc.exception),
                      resolutionNote: extractResolutionNote(exc.exception),
                    }
                  })
                  
                  allExceptions.push(...formattedExceptions)
                }
              }
            } catch (err) {
              console.error("[v0] Error fetching exceptions for run:", run._id, err)
            }
          }
        }
        setExceptions(allExceptions)
        setLoading(false)
      } catch (err: any) {
        console.log("[v0] API not available:", err.message)
        setError(err.message || "Failed to load data")
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((exc) => {
      const matchesSearch =
        (exc.employeeName && exc.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exc.runId && exc.runId.toLowerCase().includes(searchQuery.toLowerCase()))

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

      const response = await fetch(
        `${API_URL}/payroll-execution/payroll-runs/${runId}/exceptions/${employeeId}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolutionNote: resolution.resolutionNote || "",
          }),
        },
      )

      if (!response.ok) throw new Error("Failed to resolve exception")

      toast({
        title: "Success",
        description: "Exception resolved successfully",
      })

      // Refresh all exceptions
      const runsResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs`)
      if (runsResponse.ok) {
        const runsData = await runsResponse.json()
        const allExceptions: any[] = []
        
        for (const run of runsData) {
          try {
            const exceptionsResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${run._id}/exceptions`)
            if (exceptionsResponse.ok) {
              const data = await exceptionsResponse.json()
              if (data.exceptions && Array.isArray(data.exceptions)) {
                const formattedExceptions = data.exceptions.map((exc: any) => {
                  const employee = exc.employee || {}
                  const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown'
                  
                  return {
                    _id: employee._id || `${run._id}-${Math.random()}`,
                    employeeId: employee._id || '',
                    employeeName: employeeName,
                    payrollRunId: run._id,
                    runId: run.runId || run._id,
                    type: inferExceptionType(exc.exception),
                    exception: exc.exception || '',
                    status: inferExceptionStatus(exc.exception),
                    resolutionNote: extractResolutionNote(exc.exception),
                  }
                })
                allExceptions.push(...formattedExceptions)
              }
            }
          } catch (err) {
            console.error("Error refreshing exceptions:", err)
          }
        }
        setExceptions(allExceptions)
      }

      setShowModal(false)
      setSelectedException(null)
    } catch (err: any) {
      const message = err.message || "Failed to resolve exception"
      console.error("[v0] Resolution error:", message)
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
                      {run.runId || run._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExceptionList exceptions={filteredExceptions} loading={loading} onResolve={handleResolve} />

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