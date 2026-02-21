import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { FileText, Download, ExternalLink, FolderOpen } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_META = {
  catalogs: { ru: 'Каталоги пайщиков', en: 'Member Catalogs', zh: '会员目录' },
  documents: { ru: 'Документы кооператива', en: 'Cooperative Documents', zh: '合作社文件' },
  council_decisions: { ru: 'Решения совета', en: 'Council Decisions', zh: '理事会决议' },
  meetings: { ru: 'Собрания', en: 'Meetings', zh: '会议' },
  contracts: { ru: 'Договора', en: 'Contracts', zh: '合同' },
};

export default function KnowledgeBasePage() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'catalogs');

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/knowledge-base?category=${activeTab}`);
      setDocs(await res.json());
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 md:px-12 py-8" data-testid="knowledge-base-page">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight">
        {lang === 'en' ? 'Knowledge Base' : lang === 'zh' ? '知识库' : 'База знаний'}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap mb-8 h-auto gap-1">
          {Object.entries(CATEGORY_META).map(([key, names]) => (
            <TabsTrigger key={key} value={key} data-testid={`kb-tab-${key}`} className="text-xs sm:text-sm">
              {names[lang] || names.ru}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(CATEGORY_META).map(cat => (
          <TabsContent key={cat} value={cat}>
            {loading ? (
              <p className="text-center py-16 text-muted-foreground">{lang === 'en' ? 'Loading...' : 'Загрузка...'}</p>
            ) : docs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground" data-testid="kb-empty">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{lang === 'en' ? 'No documents yet' : lang === 'zh' ? '暂无文件' : 'Пока нет документов'}</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="kb-docs-list">
                {docs.map(doc => (
                  <div key={doc.doc_id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors" data-testid={`kb-doc-${doc.doc_id}`}>
                    <div className="flex items-start gap-4">
                      <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-semibold text-sm">{doc.title}</h3>
                        {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                        {doc.content && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{doc.content}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0">
                          <Download className="h-4 w-4" />
                          {lang === 'en' ? 'Download' : 'Скачать'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
