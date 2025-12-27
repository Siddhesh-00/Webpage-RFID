"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { redirect } from "next/navigation";
import { Student } from "@/types/attendance";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface EditingStudent extends Partial<Student> {
  isNew?: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<EditingStudent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchStudents();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("name");

      if (error) throw error;
      setStudents(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      student.uid?.toLowerCase().includes(search) ||
      student.name?.toLowerCase().includes(search) ||
      student.roll_no?.toLowerCase().includes(search) ||
      student.roll_number?.toLowerCase().includes(search) ||
      student.branch?.toLowerCase().includes(search) ||
      student.division?.toLowerCase().includes(search) ||
      student.college_year?.toLowerCase().includes(search)
    );
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  const handleAddNew = () => {
    setEditingStudent({
      isNew: true,
      uid: "",
      name: "",
      roll_no: "",
      branch: "",
      college_year: "",
      division: "",
      parent_contact: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent({ ...student, isNew: false });
    setIsModalOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", student.id);

      if (error) throw error;

      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(error.message || "Failed to delete student");
    }
  };

  const handleSave = async () => {
    if (!editingStudent) return;

    if (!editingStudent.uid?.trim() || !editingStudent.name?.trim()) {
      toast.error("UID and Name are required");
      return;
    }

    try {
      if (editingStudent.isNew) {
        const { error } = await supabase.from("students").insert([
          {
            uid: editingStudent.uid,
            name: editingStudent.name,
            roll_no: editingStudent.roll_no || null,
            roll_number: editingStudent.roll_no || null,
            branch: editingStudent.branch || null,
            department: editingStudent.branch || null,
            college_year: editingStudent.college_year || null,
            year: editingStudent.college_year || null,
            division: editingStudent.division || null,
            parent_contact: editingStudent.parent_contact || null,
          },
        ]);

        if (error) throw error;
        toast.success("Student added successfully");
      } else {
        const { error } = await supabase
          .from("students")
          .update({
            uid: editingStudent.uid,
            name: editingStudent.name,
            roll_no: editingStudent.roll_no || null,
            roll_number: editingStudent.roll_no || null,
            branch: editingStudent.branch || null,
            department: editingStudent.branch || null,
            college_year: editingStudent.college_year || null,
            year: editingStudent.college_year || null,
            division: editingStudent.division || null,
            parent_contact: editingStudent.parent_contact || null,
          })
          .eq("id", editingStudent.id);

        if (error) throw error;
        toast.success("Student updated successfully");
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast.error(error.message || "Failed to save student");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="noise-texture min-h-screen">
        {/* Header */}
        <header className="glassmorphic border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-['Space_Grotesk']">
                Student Registry
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage RFID card assignments and student information
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </a>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search and Stats */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by UID, Name, Roll No, Branch..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                {filteredStudents.length} students
              </div>
            </div>

            {/* Spreadsheet-like Table */}
            <div className="glassmorphic rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-32">
                        RFID UID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk']">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-28">
                        Roll No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-28">
                        Branch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-20">
                        Year
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-20">
                        Division
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-32">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider font-['Space_Grotesk'] w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          {searchTerm
                            ? "No students found matching your search"
                            : "No students registered yet. Click 'Add Student' to get started."}
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-primary/5 transition-all group"
                        >
                          <td className="px-4 py-3 text-sm font-['JetBrains_Mono'] text-primary">
                            {student.uid}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                            {student.roll_no || student.roll_number || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {student.branch || student.department || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {student.college_year || student.year || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {student.division || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-['JetBrains_Mono']">
                            {student.parent_contact || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(student)}
                                className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(student)}
                                className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredStudents.length)} of{" "}
                    {filteredStudents.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-['JetBrains_Mono']">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add/Edit Modal */}
        {isModalOpen && editingStudent && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="glassmorphic rounded-lg p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-['Space_Grotesk']">
                  {editingStudent.isNew ? "Add New Student" : "Edit Student"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    RFID UID <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.uid || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        uid: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
                    placeholder="Enter RFID Tag ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.name || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Student Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={editingStudent.roll_no || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        roll_no: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
                    placeholder="e.g., CS2024001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={editingStudent.branch || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        branch: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="e.g., CS, IT, ECE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    College Year
                  </label>
                  <input
                    type="text"
                    value={editingStudent.college_year || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        college_year: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="e.g., 2024, 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Division
                  </label>
                  <input
                    type="text"
                    value={editingStudent.division || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        division: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="e.g., A, B, C"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Parent Phone
                  </label>
                  <input
                    type="text"
                    value={editingStudent.parent_contact || ""}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        parent_contact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-['JetBrains_Mono']"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-secondary hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingStudent.isNew ? "Add Student" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
