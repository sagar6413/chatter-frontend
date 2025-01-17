import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/router';

const ServerError = () => {
  const router = useRouter();

  return (
    <section className="h-screen flex flex-col items-center justify-center gap-10 text-center">
      <Card className="p-10 shadow-lg rounded-lg">
        <Image
          src="/500.png"
          alt="Server Error"
          width={300}
          height={300}
          className="border-2 border-gray-300 rounded"
        />
        <h1 className="text-4xl font-bold">Oops! Something went wrong.</h1>
        <p className="text-lg text-gray-600">
          We encountered a server error. Please try again later or head back to the{' '}
          <Button variant="link" onClick={() => router.push('/')}>
            Home Page
          </Button>.
        </p>
      </Card>
      <div className="mt-5">
        <Image
          src="/imgs/full-logo.png"
          alt="Full Logo"
          width={100}
          height={40}
          className="object-contain"
        />
        <p className="mt-2 text-gray-500">We are working hard to fix this issue.</p>
      </div>
    </section>
  );
};

export default ServerError;
