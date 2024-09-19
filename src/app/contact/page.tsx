import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black backdrop-blur-md">
      <div className="w-full max-w-md px-4 animate-explode">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-shadow">Get in Touch</h2>
        <form className="space-y-4">
          <Input type="text" placeholder="Name" className="bg-white/5 border-white/10 placeholder-gray-400 text-white" />
          <Input type="email" placeholder="Email" className="bg-white/5 border-white/10 placeholder-gray-400 text-white" />
          <textarea
            placeholder="Message"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-md p-3 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300">Send Message</Button>
        </form>
        <div className="flex justify-center space-x-4 mt-8">
          <Link href="#" className="text-white hover:text-gray-300 transition-colors">
            <GithubIcon className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-white hover:text-gray-300 transition-colors">
            <LinkedinIcon className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-white hover:text-gray-300 transition-colors">
            <TwitterIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Contact;