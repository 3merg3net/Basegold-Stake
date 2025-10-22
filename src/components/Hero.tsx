'use client';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-darkbg via-black to-darkbg">
      <Image
        src="/logo.png"
        alt="Base Gold Logo"
        width={320}
        height={320}
        className="mb-6 drop-shadow-[0_0_20px_#d4af37]"
      />
      <h1 className="text-5xl font-bold text-gold mb-4 tracking-widest">
        Stake Your Claim
      </h1>
      <p className="text-lg text-gray-300 max-w-xl">
        The new <span className="text-gold font-semibold">Base Gold Rush</span> has begun. 
        Lock your BGLD, earn ETH rewards, and compound your fortune.
      </p>
    </section>
  );
}
