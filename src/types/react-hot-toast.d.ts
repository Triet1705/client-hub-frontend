declare module "react-hot-toast" {
  export const toast: {
    success: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void;
    dismiss: (...args: any[]) => void;
  };
  export default toast;
}
