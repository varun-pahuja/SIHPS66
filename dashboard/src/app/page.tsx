"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ModelCards } from "@/components/ModelCards";
import { DepthProfile } from "@/components/DepthProfile";
import { MetricsTable } from "@/components/MetricsTable";
import { Architecture } from "@/components/Architecture";
import { Footer } from "@/components/Footer";

const MODEL_DATA = {
  linear: {
    name: "Linear",
    description: "Simple linear regression from flattened surface inputs",
    rmse: 0.701,
    correlation: 0.751,
    params: "14.8M",
    inference: "0.2ms",
    bestFor: "Fast inference, production deployment",
  },
  cnn: {
    name: "CNN",
    description: "3-layer convolutional network with skip connections",
    rmse: 0.769,
    correlation: 0.808,
    params: "654K",
    inference: "1.1ms",
    bestFor: "Spatial feature extraction",
  },
  autoencoder: {
    name: "Autoencoder",
    description: "Conv encoder-decoder with bottleneck compression",
    rmse: 0.968,
    correlation: 0.461,
    params: "145K",
    inference: "0.8ms",
    bestFor: "Low memory, edge deployment",
  },
  vit: {
    name: "OceanEmbed",
    description: "Vision Transformer with patch embedding + MLP decoder",
    rmse: 0.917,
    correlation: 0.34,
    params: "943K",
    inference: "2.3ms",
    bestFor: "Attention visualization",
  },
  shallow: {
    name: "Shallow CNN",
    description: "2-layer minimal CNN for quick experiments",
    rmse: 1.047,
    correlation: 0.422,
    params: "8K",
    inference: "0.1ms",
    bestFor: "Minimal compute baseline",
  },
};

const DEPTH_DATA = [
  { depth: 2, rmse: 0.511, corr: 0.782 },
  { depth: 5, rmse: 0.544, corr: 0.770 },
  { depth: 10, rmse: 0.584, corr: 0.778 },
  { depth: 20, rmse: 0.632, corr: 0.798 },
  { depth: 30, rmse: 0.720, corr: 0.621 },
  { depth: 50, rmse: 0.704, corr: 0.644 },
  { depth: 75, rmse: 0.634, corr: 0.557 },
  { depth: 100, rmse: 0.806, corr: 0.647 },
  { depth: 125, rmse: 0.785, corr: 0.574 },
  { depth: 150, rmse: 0.848, corr: 0.703 },
  { depth: 200, rmse: 0.739, corr: 0.808 },
  { depth: 300, rmse: 0.661, corr: 0.889 },
  { depth: 500, rmse: 0.705, corr: 0.908 },
  { depth: 700, rmse: 0.693, corr: 0.906 },
  { depth: 1000, rmse: 0.943, corr: 0.883 },
];

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<string>("linear");

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ModelCards
          models={MODEL_DATA}
          selected={selectedModel}
          onSelect={setSelectedModel}
        />
        <DepthProfile data={DEPTH_DATA} />
        <MetricsTable models={MODEL_DATA} />
        <Architecture />
      </main>
      <Footer />
    </div>
  );
}
