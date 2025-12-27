"use client";

import { Student } from "@/types/attendance";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";

interface StudentRegistryTableProps {
  students: Student[];
}

type SortField = keyof Student | null;
type SortDirection = "asc" | "desc";

export function StudentRegistryTable({ students }: StudentRegistryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.name?.toLowerCase().includes(search) ||
          student.uid?.toLowerCase().includes(search) ||
          student.department?.toLowerCase().includes(search) ||
          student.year?.toLowerCase().includes(search) ||
          student.roll_number?.toLowerCase().includes(search)
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [students, searchTerm, sortField, sortDirection]);

  const highlightMatch = (text: string | null) => {
    if (!text || !searchTerm) return text || "-";

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark
              key={index}
              className="bg-primary/30 text-foreground rounded px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: keyof Student;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors"
    >
      {children}
      <ArrowUpDown className="w-3 h-3 opacity-50" />
    </button>
  );

  return (
    <div className="glassmorphic rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students by name, UID, department, year, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="text-sm text-muted-foreground font-['JetBrains_Mono']">
            {filteredAndSortedStudents.length} / {students.length} students
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                <SortButton field="uid">UID</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                <SortButton field="name">Name</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                <SortButton field="department">Department</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                <SortButton field="year">Year</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                <SortButton field="roll_number">Roll No</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                <SortButton field="parent_contact">Contact</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredAndSortedStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {searchTerm ? "No students found matching your search" : "No students registered yet"}
                </td>
              </tr>
            ) : (
              filteredAndSortedStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-primary/5 transition-all hover:translate-y-[-2px] hover:shadow-lg"
                >
                  <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                    {highlightMatch(student.uid)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {highlightMatch(student.name)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {highlightMatch(student.department)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {highlightMatch(student.year)}
                  </td>
                  <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                    {highlightMatch(student.roll_number)}
                  </td>
                  <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                    {student.parent_contact || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
