"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import EditService from "@/services/editService";

// Types
interface Post {
  id: number;
  title: string;
  url_anh: string;
  content: string;
  editor_realname: string;
  status?: string;
  create_at?: string;
  update_at?: string;
}

interface PostFormData {
  title: string;
  url_anh: string;
  content: string;
  editor_realname: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    url_anh: "",
    content: "",
    editor_realname: "",
  });
  const [errors, setErrors] = useState<Partial<PostFormData>>({});
  
  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    postId: number | null;
    postTitle: string;
  }>({
    isOpen: false,
    postId: null,
    postTitle: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");

    if (!stored) {
      setToken(null);
      return;
    }

    try {
      const userData = JSON.parse(stored);
      setToken(userData.access_token || null);
    } catch {
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchPosts();
  }, [token]);

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        url_anh: editingPost.url_anh,
        content: editingPost.content,
        editor_realname: editingPost.editor_realname,
      });
    } else {
      setFormData({
        title: "",
        url_anh: "",
        content: "",
        editor_realname: "",
      });
    }
    setErrors({});
  }, [editingPost]);

  const fetchPosts = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const result: ApiResponse<Post[]> = await EditService.AllPosts(token);

      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        toast.error(result.error || "Không thể tải danh sách bài viết");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PostFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }
    if (!formData.url_anh.trim()) {
      newErrors.url_anh = "URL ảnh không được để trống";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Nội dung không được để trống";
    }
    if (!formData.editor_realname.trim()) {
      newErrors.editor_realname = "Tên tác giả không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) return;
    
    setIsSubmitting(true);
    try {
      let result: ApiResponse<any>;

      if (editingPost) {
        result = await EditService.UpdatePost(
          editingPost.id,
          formData.title,
          token,
          formData.url_anh,
          formData.content
        );
      } else {
        result = await EditService.CreatePost(
          formData.title,
          formData.url_anh,
          formData.content,
          token,
          formData.editor_realname
        );
      }

      if (result.success) {
        toast.success(
          result.message || 
          (editingPost ? "Cập nhật bài viết thành công!" : "Tạo bài viết thành công!")
        );
        setEditingPost(null);
        await fetchPosts();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("Đã xảy ra lỗi không mong muốn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
   
    if (errors[name as keyof PostFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.postId || !token) return;

    setIsDeleting(true);
    try {
      const result: ApiResponse<any> = await EditService.Deletepost(
        deleteModal.postId,
        token
      );

      if (result.success) {
        toast.success(result.message || "Xóa bài viết thành công!");
        setDeleteModal({ isOpen: false, postId: null, postTitle: "" });
        await fetchPosts();
      } else {
        toast.error(result.error || "Không thể xóa bài viết");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Đã xảy ra lỗi khi xóa bài viết");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setDeleteModal({
        isOpen: true,
        postId: id,
        postTitle: post.title,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, postId: null, postTitle: "" });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quản Lý Bài Viết
          </h1>
          <p className="text-gray-600">
            Tạo, chỉnh sửa và xóa bài viết của bạn
          </p>
        </div>

        {/* POST FORM */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingPost ? "Sửa Bài Viết" : "Tạo Bài Viết Mới"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tiêu đề */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tiêu đề bài viết"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Tác giả */}
            <div>
              <label
                htmlFor="editor_realname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên tác giả <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="editor_realname"
                name="editor_realname"
                value={formData.editor_realname}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.editor_realname ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên tác giả"
                disabled={isSubmitting}
              />
              {errors.editor_realname && (
                <p className="text-red-500 text-sm mt-1">{errors.editor_realname}</p>
              )}
            </div>

            {/* URL Ảnh */}
            <div>
              <label
                htmlFor="url_anh"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Ảnh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="url_anh"
                name="url_anh"
                value={formData.url_anh}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url_anh ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
              {errors.url_anh && (
                <p className="text-red-500 text-sm mt-1">{errors.url_anh}</p>
              )}
              {formData.url_anh && !errors.url_anh && (
                <div className="mt-2">
                  <img
                    src={formData.url_anh}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Nội dung */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập nội dung bài viết"
                disabled={isSubmitting}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : editingPost
                  ? "Cập Nhật"
                  : "Tạo Bài Viết"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>

        {/* POST LIST */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách bài viết...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600">
                Hãy tạo bài viết đầu tiên của bạn bằng form bên trên!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Danh Sách Bài Viết
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {posts.length} bài viết
              </span>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={post.url_anh}
                        alt={post.title}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2 w-[400px]">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {post.id}</span>
                        <span>•</span>
                        <span>Tác giả: {post.editor_realname}</span>
                        {post.create_at && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(post.create_at).toLocaleDateString("vi-VN")}
                            </span>
                          </>
                        )}
                        {post.status && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {post.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Xác Nhận Xóa Bài Viết
              </h3>
              
              <p className="text-gray-600 mb-2">
                Bạn có chắc chắn muốn xóa bài viết này không?
              </p>
              
              <div className="bg-gray-100 p-3 rounded-lg mb-6">
                <p className="font-medium text-gray-800 line-clamp-2">
                  {deleteModal.postTitle}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? "Đang xóa..." : "Xóa Bài Viết"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}