import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { ArrowUpRight, Activity, Radio, Shield, Zap } from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen animated-gradient">
      <div className="noise-texture min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 mb-8">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-['JetBrains_Mono']">Real-Time IoT Monitoring</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold font-['Space_Grotesk'] mb-6 leading-tight">
                RFID Attendance System
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-['Manrope']">
                Enterprise-grade attendance monitoring powered by ESP8266 RFID scanners. 
                Real-time data synchronization, instant analytics, and mission-critical reliability.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href={user ? "/dashboard" : "/sign-in"}
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 font-medium"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center px-6 py-3 glassmorphic rounded-lg hover:border-primary/50 transition-all font-medium"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-4">
                Command Center Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for IT administrators who need instant visibility into campus attendance patterns
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Activity className="w-6 h-6" />,
                  title: "Live Feed",
                  description: "Real-time attendance logs with WebSocket updates",
                },
                {
                  icon: <Radio className="w-6 h-6" />,
                  title: "IoT Integration",
                  description: "Direct ESP8266 device monitoring and diagnostics",
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "< 200ms Latency",
                  description: "Ultra-fast API endpoints with performance monitoring",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Data Integrity",
                  description: "Duplicate detection and unknown UID handling",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glassmorphic p-6 rounded-lg hover:border-primary/50 transition-all group"
                >
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold font-['Space_Grotesk'] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 glassmorphic mx-4 rounded-2xl">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold font-['Space_Grotesk'] text-primary mb-2">
                  Real-Time
                </div>
                <div className="text-muted-foreground">WebSocket Updates</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-['Space_Grotesk'] text-primary mb-2">
                  Multi-Device
                </div>
                <div className="text-muted-foreground">ESP8266 Support</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-['Space_Grotesk'] text-primary mb-2">
                  99.9%
                </div>
                <div className="text-muted-foreground">System Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-4">
              Ready to Deploy?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start monitoring attendance with enterprise-grade infrastructure
            </p>
            <a
              href={user ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 font-medium"
            >
              {user ? "Open Dashboard" : "Create Account"}
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
