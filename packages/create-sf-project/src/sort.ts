// https://github.com/vuejs/create-vue/blob/main/utils/sortDependencies.ts
export default function sortDependencies(packageJson: object) {
    const sorted = {}

    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

    for (const depType of depTypes) {
        if (packageJson[depType]) {
            sorted[depType] = {}

            Object.keys(packageJson[depType])
                .sort()
                .forEach((name) => {
                    sorted[depType][name] = packageJson[depType][name]
                })
        }
    }

    return {
        ...packageJson,
        ...sorted
    }
}
