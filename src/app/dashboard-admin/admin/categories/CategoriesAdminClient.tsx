"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/dashboard-admin/components/Toast";
import { adminApi } from "@/lib/admin-api";
import type { ApiCategory } from "@/lib/category-actions";

export default function CategoriesAdminClient({
  categories,
}: {
  categories: ApiCategory[];
}) {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("category");
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setIcon("category");
    setEditingId(null);
  }

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string }) => {
      return adminApi<ApiCategory>("categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toastSuccess("Berhasil menambahkan kategori");
      resetForm();
    },
    onError: (err: Error) => {
      toastError("Gagal menambahkan kategori", err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; icon?: string } }) => {
      return adminApi<ApiCategory>(`categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toastSuccess("Berhasil memperbarui kategori");
      resetForm();
    },
    onError: (err: Error) => {
      toastError("Gagal memperbarui kategori", err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi(`categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toastSuccess("Berhasil menghapus kategori");
    },
    onError: (err: Error) => {
      toastError("Gagal menghapus kategori", err.message);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toastError("Nama kategori wajib diisi");

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name: name.trim(), icon: icon.trim() } });
    } else {
      createMutation.mutate({ name: name.trim(), icon: icon.trim() });
    }
  }

  function handleEditClick(category: ApiCategory) {
    setEditingId(category.id);
    setName(category.name);
    setIcon(category.icon ?? "category");
  }

  function handleDeleteClick(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    deleteMutation.mutate(id);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Form Card */}
      <div className="rounded-2xl border border-[#bfc9c3]/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
        <h2 className="text-lg font-bold text-[#191c1d] mb-4">
          {editingId ? "Edit Kategori" : "Kategori Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
              Nama Kategori <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm text-[#191c1d] outline-none transition-all focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20"
              placeholder="Contoh: Gadget, Pakaian, Jasa Desain"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#707974]">
              Icon Material Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-[#bfc9c3] bg-[#f8f9fa] px-4 py-2.5 text-sm text-[#191c1d] outline-none transition-all focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20"
              placeholder="Contoh: devices, checkroom, home"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
            <p className="text-[10px] text-[#707974]">
              Gunakan nama icon dari Google Material Symbols (e.g. devices, checkroom, home, kitchen).
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-[#064e3b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#043b2d] disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : editingId ? "Perbarui" : "Tambah Kategori"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#bfc9c3] px-4 py-2.5 text-sm font-semibold text-[#404944] transition-all hover:bg-[#f8f9fa]"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="lg:col-span-2 rounded-2xl border border-[#bfc9c3]/50 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#191c1d] mb-4">Daftar Kategori Terdaftar</h2>

        {categories.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#bfc9c3] rounded-xl bg-[#f8f9fa]">
            <span className="material-symbols-outlined text-4xl text-[#707974] mb-2">category</span>
            <p className="text-sm font-medium text-[#404944]">Belum ada kategori terdaftar di database.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-[#bfc9c3]/30 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-[#191c1d]">
              <thead className="bg-[#f8f9fa] border-b border-[#bfc9c3]/30 text-xs font-semibold uppercase tracking-wider text-[#404944]">
                <tr>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bfc9c3]/20">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#f8f9fa]/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="material-symbols-outlined text-xl text-[#064e3b]">
                        {cat.icon ?? "category"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#191c1d]">{cat.name}</td>
                    <td className="px-4 py-3.5 text-xs text-[#707974]">{cat.slug}</td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#404944] hover:bg-[#e7e8e9] transition-all"
                        title="Edit Kategori"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat.id)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] transition-all"
                        title="Hapus Kategori"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
