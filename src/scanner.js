import chalk from 'chalk';

export async function checkPackage(packageName) {
    console.log(chalk.blue(`\n🔍 Gatekeeper is inspecting metadata for: ${packageName}...`));
    
    let isSafe = true;
    let hardBlock = false;

    try {
        const response = await fetch(`https://registry.npmjs.org/${packageName}`);
        
        if (!response.ok) {
            throw new Error(`Registry returned status ${response.status}`);
        }

        const fullMetadata = await response.json();
        const latestVersion = fullMetadata['dist-tags'].latest;
        const latestData = fullMetadata.versions[latestVersion];
        const scripts = latestData.scripts || {};

        // 🛡️ CHECK 1: Google OSV Vulnerability Database (HARD BLOCK)
        console.log(chalk.gray(`   Checking Google OSV database for known vulnerabilities...`));
        const osvResponse = await fetch('https://api.osv.dev/v1/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                version: latestVersion,
                package: { name: packageName, ecosystem: "npm" }
            })
        });
        
        if (osvResponse.ok) {
            const osvData = await osvResponse.json();
            if (osvData.vulns && osvData.vulns.length > 0) {
                console.log(chalk.red.bold(`\n🚨 CRITICAL: KNOWN MALWARE DETECTED IN OSV DATABASE 🚨`));
                console.log(chalk.red(`   Package: ${packageName}@${latestVersion}`));
                console.log(chalk.red(`   Vulnerabilities found: ${osvData.vulns.length}`));
                console.log(chalk.red(`   This payload will be hard-blocked. No override permitted.`));
                return { isSafe: false, hardBlock: true };
            }
        }

        // 🚨 CHECK 2: Malicious Lifecycle Scripts
        if (scripts.postinstall || scripts.preinstall || scripts.install) {
            console.log(chalk.red.bold(`\n⚠️  WARNING: ${packageName} contains hidden installation scripts.`));
            console.log(chalk.yellow(`   Script found: ${scripts.postinstall || scripts.preinstall || scripts.install}`));
            isSafe = false;
        }

        // 🕒 CHECK 3: Package Age
        const publishTimeString = fullMetadata.time[latestVersion];
        const publishTime = new Date(publishTimeString || Date.now()); 
        const ageInHours = (new Date() - publishTime) / (1000 * 60 * 60);
        
        if (ageInHours < 48) {
            console.log(chalk.yellow(`\n⚠️  NEW PACKAGE ALERT: Version ${latestVersion} was published only ${Math.round(ageInHours)} hours ago.`));
            isSafe = false;
        }

        if (isSafe) {
            console.log(chalk.green(`✅ ${packageName}@${latestVersion} passed heuristics scan. No obvious threats detected.`));
        }

        return { isSafe, hardBlock }; 
        
    } catch (error) {
        console.error(chalk.red(`\n❌ Could not fetch package data for '${packageName}'.`));
        console.error(chalk.gray(`   Error details: ${error.message}`));
        return { isSafe: false, hardBlock: false }; 
    }
}