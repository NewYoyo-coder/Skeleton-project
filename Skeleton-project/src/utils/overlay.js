import Swal from "sweetalert2";
import { toast } from "vue-sonner";

// 🚀 1. 토스트 스타일 집대성 (토스 감성 100%)
// src/utils/overlay.js 내 toastOptions 부분
const toastOptions = {
  style: {
    borderRadius: "24px",
    padding: "20px 24px", // 🚀 위아래 20, 좌우 24로 정사각형에 가까운 쫀득함
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    border: "none",
    fontFamily: "inherit",
    display: "flex",
    flexDirection: "column", // 🚀 세로 정렬
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "240px", // 🚀 가로 길이를 아예 딱 고정 (가장 깔끔함)
  },
};
// 🚀 2. SweetAlert2 스타일 (중앙 모달)
const getSwalConfig = () => ({
  background:
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "#242424"
      : "#ffffff",
  color:
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "#ffffff"
      : "#212529",
  confirmButtonColor: "#3182f6",
  cancelButtonColor: "#f1f3f5", // 취소 버튼은 연한 회색으로 세련되게
  reverseButtons: true,
  customClass: {
    popup: "rounded-5 shadow-lg border-0", // 압도적으로 둥근 모서리
    confirmButton: "px-4 py-2 fw-bold rounded-3",
    cancelButton: "px-4 py-2 fw-bold rounded-3 text-dark",
  },
});

/**
 * [확인/취소] 일반 모달
 */
export const ask = async (title, text = "") => {
  const result = await Swal.fire({
    ...getSwalConfig(),
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "확인",
    cancelButtonText: "취소",
  });
  return result.isConfirmed;
};

/**
 * [삭제 확인] 특화 모달
 */
export const confirmDelete = async (target = "내역을") => {
  const result = await Swal.fire({
    ...getSwalConfig(),
    title: "정말 삭제할까요?",
    text: `${target} 삭제하면 복구할 수 없습니다!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "삭제",
    cancelButtonText: "취소",
    confirmButtonColor: "#f04452", // 삭제는 강력한 레드
  });
  return result.isConfirmed;
};

/**
 * [입력] 간단 텍스트 입력 모달
 */
export const prompt = async (title, placeholder = "", defaultValue = "") => {
  const { value } = await Swal.fire({
    ...getSwalConfig(),
    title,
    input: "text",
    inputPlaceholder: placeholder,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonText: "확인",
    cancelButtonText: "취소",
  });
  return value;
};

/**
 * [토스트] 알림 콤보 (toss.머시기 감성)
 */
export const notify = {
  success: (msg) => toast.success(msg, toastOptions),
  error: (msg) => toast.error(msg, toastOptions),
  warning: (msg) => toast.warning(msg, toastOptions),
  info: (msg) => toast(msg, toastOptions),

  /**
   * [로딩 콤보] API 호출 시 사용
   */
  promise: (promise, loading, success, error) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
      ...toastOptions,
    });
  },
};
