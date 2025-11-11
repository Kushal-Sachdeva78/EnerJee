import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Github, Linkedin, Instagram, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Contact Us</h1>
        </div>
        <p className="text-muted-foreground">
          Get in touch with the EnerJee team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Get In Touch</CardTitle>
            <CardDescription>
              We'd love to hear from you about EnerJee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">contact@enerjee.ai</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">+91 9876543210</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Follow Us</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  data-testid="link-linkedin"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  data-testid="link-github"
                >
                  <Github className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  data-testid="link-instagram"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  data-testid="input-message"
                  placeholder="Your message..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" data-testid="button-submit">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
