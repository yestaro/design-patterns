import React from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";

// Register languages to keep bundle size small
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("java", java);

interface CodeBlockProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
    code,
    language = "javascript",
    showLineNumbers = false,
    className = "",
}) => {
    return (
        <div className={`overflow-auto custom-scrollbar ${className}`}>
            <div className="text-sm md:text-base w-max min-w-full p-4">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        backgroundColor: "transparent",
                        fontSize: "inherit",
                        lineHeight: "1.5",
                        overflow: "visible",
                    }}
                    showLineNumbers={showLineNumbers}
                    wrapLines={true}
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlock;
