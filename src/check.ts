import { framer } from "framer-plugin"

export type CheckResult = {
    id: string
    title: string
    status: "pass" | "fail" | "warning"
    details?: string[]
}

export type Check = {
    id: string
    title: string
    run: () => Promise<CheckResult>
}

const normalizeText = (text: string) =>
    text.toLowerCase().replace(/\s+/g, " ").trim()

const placeholderPhrases = [
    "lorem ipsum",
    "dolor sit amet",
    "consectetur adipiscing elit",
    "sed do eiusmod",
    "tempor incididunt",
    "ut labore et dolore",
    "magna aliqua"
]

export const checks: Check[] = [

    // ✅ Placeholder Text
    {
        id: "placeholder-text",
        title: "No Placeholder Text",
        run: async () => {
            const nodes = await framer.getNodesWithType("TextNode")
            const issues: string[] = []

            for (const node of nodes) {
                const text = await node.getText()
                if (!text) continue

                const norm = normalizeText(text)
                if (placeholderPhrases.some(p => norm.includes(p))) {
                    issues.push(`❌ Placeholder detected: “${text.slice(0, 40)}${text.length > 40 ? "…" : ""}”`)
                }
            }

            return {
                id: "placeholder-text",
                title: "No Placeholder Text",
                status: issues.length > 0 ? "fail" : "pass",
                details: issues
            }
        }
    },

    // ✅ Unnamed Layers
    {
        id: "unnamed-layers",
        title: "All Design Layers Are Named",
        run: async () => {
            const all = [
                ...(await framer.getNodesWithType("FrameNode")),
                ...(await framer.getNodesWithType("TextNode")),
                ...(await framer.getNodesWithType("ComponentInstanceNode")),
                ...(await framer.getNodesWithType("SVGNode"))
            ]

            const issues = all
                .filter(n => !n.name || n.name.trim() === "")
                .map(n => `❌ ${n.__class} is unnamed. Please name all layers.`)

            return {
                id: "unnamed-layers",
                title: "All Design Layers Are Named",
                status: issues.length > 0 ? "fail" : "pass",
                details: issues
            }
        }
    },

    // ✅ Empty Text Layers
    {
        id: "empty-text",
        title: "Text Layers Are Not Empty",
        run: async () => {
            const nodes = await framer.getNodesWithType("TextNode")
            const issues: string[] = []

            for (const node of nodes) {
                const text = await node.getText()
                if (!text || text.trim() === "") {
                    issues.push(`❌ Empty Text Layer — remove or fill with meaningful content.`)
                }
            }

            return {
                id: "empty-text",
                title: "Text Layers Are Not Empty",
                status: issues.length > 0 ? "fail" : "pass",
                details: issues
            }
        }
    },

    // ✅ Generic Component Names
    {
        id: "generic-component-names",
        title: "No Generic Component Names",
        run: async () => {
            const components = [
                ...(await framer.getNodesWithType("ComponentInstanceNode")),
                ...(await framer.getNodesWithType("ComponentNode"))
            ]

            const issues = components
                .filter(n => n.name?.trim().toLowerCase().match(/^component\d+$|^widget\d+$/))
                .map(n => `❌ Generic component name found: "${n.name}". Use a descriptive name.`)

            return {
                id: "generic-component-names",
                title: "No Generic Component Names",
                status: issues.length > 0 ? "fail" : "pass",
                details: issues
            }
        }
    },

    // ✅ Repetitive Frame Structures
    {
        id: "reusable-content",
        title: "Repetitive Elements Should Be Components",
        run: async () => {
            const frames = await framer.getNodesWithType("FrameNode")
            const seen = new Map<string, number>()

            for (const frame of frames) {
                const children = await framer.getChildren(frame.id)
                const key = `children-${children.length}`
                seen.set(key, (seen.get(key) || 0) + 1)
            }

            const isRepeating = [...seen.values()].some(count => count > 5)

            return {
                id: "reusable-content",
                title: "Repetitive Elements Should Be Components",
                status: isRepeating ? "warning" : "pass",
                details: isRepeating
                    ? ["⚠️ This project contains many similar frames. Consider converting them into components."]
                    : []
            }
        }
    }

]