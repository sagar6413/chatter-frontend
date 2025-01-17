import { useRouter } from 'next/navigation';

export const useRedirectAfterAuth = () => {
  const router = useRouter();

  const setRedirectPath = (path: string) => {
    localStorage.setItem('redirectAfterAuth', path);
  };

  const getRedirectPath = (): string => {
    const path = localStorage.getItem('redirectAfterAuth') || '/';
    localStorage.removeItem('redirectAfterAuth');
    return path;
  };

  const redirectToPreviousPage = () => {
    const path = getRedirectPath();
    router.push(path);
    setRedirectPath('/');
  };

  return { setRedirectPath, getRedirectPath, redirectToPreviousPage };
};