type LayoutProps = {
  children?: string
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html>
      <head>
        <meta charset='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <script src='https://cdn.tailwindcss.com' />
      </head>
      <body class='bg-gray-800'>
        {children}
      </body>
    </html>  
  )
}
