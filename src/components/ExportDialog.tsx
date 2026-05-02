import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/state/store';
import { exportMarkdown, exportCSV, exportText, downloadFile } from '@/lib/export';
import type { City } from '@/data/cities';

type Tab = 'markdown' | 'csv' | 'text';

type Props = {
  cities: City[];
};

export function ExportDialog({ cities }: Props) {
  const { rankings } = useStore();
  const [tab, setTab] = useState<Tab>('markdown');
  const [copied, setCopied] = useState(false);

  const content =
    tab === 'markdown'
      ? exportMarkdown(rankings, cities)
      : tab === 'csv'
      ? exportCSV(rankings, cities)
      : exportText(rankings, cities);

  function copy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function download() {
    const [ext, mime] =
      tab === 'csv'
        ? ['csv', 'text/csv']
        : tab === 'markdown'
        ? ['md', 'text/markdown']
        : ['txt', 'text/plain'];
    downloadFile(content, `city-rankings.${ext}`, mime);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Rankings</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          {(['markdown', 'csv', 'text'] as Tab[]).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t === 'markdown' ? 'Markdown' : t === 'csv' ? 'CSV' : 'Plain text'}
            </Button>
          ))}
        </div>
        <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
          {content || 'No cities ranked yet.'}
        </pre>
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" onClick={download}>
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
