import { SignUpRequest } from "@/types";

import { SignInRequest } from "@/types";
import { useState } from "react";

export const useAuth = () => {

    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
 
  const signin = async (data: SignInRequest) => {
    console.log(data);
    
  };

  const signup = async (data: SignUpRequest) => {
    console.log(data);       
  };
  return { signin, signup, loading, error };
};
