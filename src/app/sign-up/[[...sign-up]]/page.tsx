import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        afterSignUpUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary: "bg-black hover:bg-gray-800",
          },
        }}
      />
    </div>
  );
} 