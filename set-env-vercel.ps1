# Script to set Vercel environment variables
$envVars = @{
    "DATABASE_URL" = "postgresql://cc3a63cef394fda015cfbcb31808841a9e2130e3b1df4692901304fcd1f4e818:sk_HYXTHWqXCTcackIKF_Xmx@db.prisma.io:5432/postgres?sslmode=require"
    "NEXTAUTH_SECRET" = "2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"
    "NEXTAUTH_URL" = "https://ngopidijogja-peach.vercel.app"
    "BLOB_READ_WRITE_TOKEN" = "vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
}

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Setting $key..."

    # Set for production
    echo $value | vercel env add $key production

    # Set for preview
    echo $value | vercel env add $key preview

    # Set for development
    echo $value | vercel env add $key development
}

Write-Host "Done! All environment variables have been set."
