import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { APP_VERSION } from "@/lib/constants";
import "./globals.css";

const blockFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-block",
});

export const metadata: Metadata = {
  title: "Create Earth",
  description: "Create Earth — build your world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              var version="${APP_VERSION}";
              var versionKey="create-earth-version";
              var prev=localStorage.getItem(versionKey);
              var legacyKeys=[
                "pizza-restaurant-save",
                "slice-serve-version",
                "snake-arena-version"
              ];
              for(var i=0;i<legacyKeys.length;i++){
                localStorage.removeItem(legacyKeys[i]);
              }
              if("serviceWorker" in navigator){
                navigator.serviceWorker.getRegistrations().then(function(regs){
                  for(var j=0;j<regs.length;j++){regs[j].unregister();}
                });
              }
              if(prev&&prev!==version){
                localStorage.setItem(versionKey,version);
                location.reload();
                return;
              }
              localStorage.setItem(versionKey,version);
            })();`,
          }}
        />
      </head>
      <body className={blockFont.variable}>{children}</body>
    </html>
  );
}
