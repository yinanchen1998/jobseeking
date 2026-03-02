import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Globe, Github, ExternalLink } from 'lucide-react';
import type { DiscoveredTool } from '@/types';

interface SearchResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tools: DiscoveredTool[];
  onSave: (selectedTools: DiscoveredTool[]) => Promise<void>;
  isSaving: boolean;
}

export function SearchResultsDialog({ 
  isOpen, 
  onClose, 
  tools, 
  onSave, 
  isSaving 
}: SearchResultsDialogProps) {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  
  // 默认全选
  useState(() => {
    if (tools.length > 0) {
      setSelectedTools(new Set(tools.map(t => t.slug)));
    }
  });

  const toggleTool = (slug: string) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedTools(newSelected);
  };

  const toggleAll = () => {
    if (selectedTools.size === tools.length) {
      setSelectedTools(new Set());
    } else {
      setSelectedTools(new Set(tools.map(t => t.slug)));
    }
  };

  const handleSave = async () => {
    const toolsToSave = tools.filter(t => selectedTools.has(t.slug));
    await onSave(toolsToSave);
    setSelectedTools(new Set());
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'github': return <Github className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'github': return '开源';
      case 'website': return '官网';
      case 'app': return 'App';
      case 'extension': return '插件';
      default: return source;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      resume: '简历',
      interview: '面试',
      career: '职业规划',
      skill: '技能提升',
      matching: '职位匹配',
      other: '其他'
    };
    return labels[category] || category;
  };

  if (tools.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              搜索完成
            </DialogTitle>
            <DialogDescription>
              未找到新的工具。现有库中已包含相关工具。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>知道了</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔍 Kimi 发现 {tools.length} 个新工具
          </DialogTitle>
          <DialogDescription>
            请选择要保存到工具库的工具，已存在的工具已自动过滤
          </DialogDescription>
        </DialogHeader>

        {/* 工具列表 */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {/* 全选按钮 */}
          <div className="flex items-center gap-2 px-2 pb-2 border-b">
            <Checkbox 
              checked={selectedTools.size === tools.length && tools.length > 0}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm font-medium">
              全选 ({selectedTools.size}/{tools.length})
            </span>
          </div>

          {tools.map((tool) => (
            <div 
              key={tool.slug}
              className={`p-3 rounded-lg border transition-colors ${
                selectedTools.has(tool.slug) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={selectedTools.has(tool.slug)}
                  onCheckedChange={() => toggleTool(tool.slug)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{tool.chineseName || tool.name}</h4>
                    <span className="text-sm text-gray-500">{tool.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tool.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(tool.category)}
                    </Badge>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {getSourceIcon(tool.source)}
                      {getSourceLabel(tool.source)}
                    </Badge>
                    <a 
                      href={tool.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      访问官网
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || selectedTools.size === 0}
            className="bg-[#7e43ff] hover:bg-[#6527ec]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                保存选中 ({selectedTools.size}个)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
