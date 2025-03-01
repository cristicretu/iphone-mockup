import { IphoneMockup } from "@/components/iphone-mockup"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">iPhone Video Frame Capture</h1>
        <p className="text-center mb-8 text-slate-600">
          Upload your video to see it displayed in an iPhone mockup. You can capture and download any frame as an image.
        </p>
        <IphoneMockup />
      </div>
    </main>
  )
}

