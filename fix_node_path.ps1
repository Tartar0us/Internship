# Fix Node.js PATH environment variable for regular terminals

# Get Node.js installation path from registry
$nodeRegPath = 'HKLM:\SOFTWARE\Node.js'
if (Test-Path $nodeRegPath) {
    $nodePath = Get-ItemProperty -Path $nodeRegPath | Select-Object -ExpandProperty InstallPath -ErrorAction SilentlyContinue
    if ($nodePath) {
        $nodeBinPath = Join-Path $nodePath 'node_modules\npm\bin'
        if (Test-Path $nodeBinPath) {
            # Get current user PATH
            $currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')

            # Check if Node.js path already exists
            if ($currentPath -notlike "*$nodeBinPath*") {
                # Add Node.js path to user PATH
                $newPath = "$currentPath;$nodeBinPath"
                [Environment]::SetEnvironmentVariable('PATH', $newPath, 'User')
                Write-Host "Successfully added Node.js path to user environment variables"
                Write-Host "Please restart your terminal for changes to take effect"
            } else {
                Write-Host "Node.js path is already in user environment variables"
            }
        } else {
            Write-Host "Node.js npm bin path not found at: $nodeBinPath"
        }
    } else {
        Write-Host "Node.js installation path not found in registry"
    }
} else {
    Write-Host "Node.js registry key not found"
}