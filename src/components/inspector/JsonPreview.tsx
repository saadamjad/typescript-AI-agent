interface JsonPreviewProps {
  data: unknown;
}

export function JsonPreview({ data }: JsonPreviewProps) {
  return (
    <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
