"use client";

import { useState, useEffect } from "react";
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
    bestFor: "Best accuracy, spatial feature extraction",
  },
  autoencoder: {
    name: "Autoencoder",
    description: "Conv encoder-decoder with bottleneck compression",
    rmse: 0.968,
    correlation: 0.461,
    params: "145K",
    inference: "0.8ms",
    bestFor: "Low memory footprint, edge deployment",
  },
  vit: {
    name: "OceanEmbed",
    description: "Vision Transformer with patch embedding + MLP decoder",
    rmse: 0.917,
    correlation: 0.34,
    params: "943K",
    inference: "2.3ms",
    bestFor: "Research baseline, attention visualization",
  },
  shallow: {
    name: "Shallow CNN",
    description: "2-layer minimal CNN for quick experiments",
    rmse: 1.047,
    correlation: 0.422,
    params: "8K",
    inference: "0.1ms",
    bestFor: "Minimal compute, learning baseline",
  },
};

const DEPTH_DATA = [
  { depth: 2, rmse: 0.608, corr: 0.947 },
  { depth: 5, rmse: 0.611, corr: 0.947 },
  { depth: 10, rmse: 0.603, corr: 0.948 },
  { depth: 20, rmse: 0.617, corr: 0.947 },
  { depth: 30, rmse: 0.652, corr: 0.943 },
  { depth: 50, rmse: 0.732, corr: 0.934 },
  { depth: 75, rmse: 0.828, corr: 0.922 },
  { depth: 100, rmse: 0.933, corr: 0.907 },
  { depth: 125, rmse: 1.052, corr: 0.89 },
  { depth: 150, rmse: 1.187, corr: 0.871 },
  { depth: 200, rmse: 1.488, corr: 0.825 },
  { depth: 300, rmse: 1.965, corr: 0.748 },
  { depth: 500, rmse: 2.561, corr: 0.633 },
  { depth: 700, rmse: 2.695, corr: 0.596 },
  { depth: 1000, rmse: 2.734, corr: 0.585 },
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
