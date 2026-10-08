$ErrorActionPreference = "Stop"
$secure = Read-Host "Nueva contraseña de administración (mínimo 14 caracteres)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $env:ADMIN_PASSWORD_ONESHOT = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  node scripts/hash-admin-password.mjs
  if ($LASTEXITCODE -ne 0) { throw "No se pudo generar el hash." }
} finally {
  Remove-Item Env:ADMIN_PASSWORD_ONESHOT -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  $secure.Dispose()
}
