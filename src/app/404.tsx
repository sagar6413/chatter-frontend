import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/router';
import err404 from '../public/404.png';

const PageNotFound = () => {
  const router = useRouter();

  return (
    <section className="h-screen flex flex-col items-center justify-center gap-10 text-center">
      <Card className="p-10 shadow-lg rounded-lg">
        <Image
          src={err404}
          alt="Page Not Found"
          width={300}
          height={300}
          className="border-2 border-gray-300 rounded"
        />
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-lg text-gray-600">
          The page you are looking for does not exist. Head back to the{' '}
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
        <p className="mt-2 text-gray-500">Read millions of stories around the world.</p>
      </div>
    </section>
  );
};

export default PageNotFound;
