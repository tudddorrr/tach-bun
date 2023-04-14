type LayoutProps = {
  children?: string
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html>
      <head>
        <link rel='stylesheet' href='https://unpkg.com/sakura.css/css/sakura.css' type='text/css' />
      </head>
      <body>
        {children}
      </body>
    </html>  
  )
}
