/**
 * GitHub Integration for Autonomous Enhancements
 * Enables Eliza to make autonomous code improvements and commits
 */

import { apiKeyManager } from './api-key-manager';

export interface GitHubRepository {
  owner: string;
  repo: string;
  branch: string;
}

export interface EnhancementProposal {
  id: string;
  title: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
  }>;
  rationale: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  category: 'bug-fix' | 'performance' | 'feature' | 'refactor' | 'security';
}

export interface GitHubConfig {
  repository: GitHubRepository;
  autoCommit: boolean;
  requireApproval: boolean;
  branchPrefix: 'eliza-enhancement';
}

class GitHubIntegration {
  private config: GitHubConfig | null = null;
  private lastCommitSha: string | null = null;

  // Initialize GitHub integration with repository info
  async initialize(repository: GitHubRepository, options: Partial<GitHubConfig> = {}): Promise<boolean> {
    const token = apiKeyManager.getKey('githubPersonalAccessToken');
    if (!token) {
      console.error('GitHub Personal Access Token not configured');
      return false;
    }

    this.config = {
      repository,
      autoCommit: options.autoCommit ?? false,
      requireApproval: options.requireApproval ?? true,
      branchPrefix: options.branchPrefix || 'eliza-enhancement',
    };

    try {
      // Verify repository access
      await this.getRepositoryInfo();
      console.log('✅ GitHub integration initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize GitHub integration:', error);
      return false;
    }
  }

  // Get repository information
  private async getRepositoryInfo() {
    if (!this.config) throw new Error('GitHub integration not initialized');
    
    const token = apiKeyManager.getKey('githubPersonalAccessToken');
    const { owner, repo } = this.config.repository;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Analyze codebase for improvement opportunities
  async analyzeCodebase(): Promise<EnhancementProposal[]> {
    if (!this.config) return [];

    try {
      // Get repository contents
      const files = await this.getRepositoryFiles();
      const proposals: EnhancementProposal[] = [];

      // Analyze files for potential improvements
      for (const file of files) {
        if (file.path.endsWith('.tsx') || file.path.endsWith('.ts')) {
          const content = await this.getFileContent(file.path);
          const fileProposals = await this.analyzeFile(file.path, content);
          proposals.push(...fileProposals);
        }
      }

      return proposals.slice(0, 5); // Limit to top 5 proposals
    } catch (error) {
      console.error('Failed to analyze codebase:', error);
      return [];
    }
  }

  // Get repository file list
  private async getRepositoryFiles(path = '') {
    if (!this.config) return [];
    
    const token = apiKeyManager.getKey('githubPersonalAccessToken');
    const { owner, repo, branch } = this.config.repository;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get repository files: ${response.statusText}`);
    }

    return response.json();
  }

  // Get file content from GitHub
  private async getFileContent(filePath: string): Promise<string> {
    if (!this.config) return '';
    
    const token = apiKeyManager.getKey('githubPersonalAccessToken');
    const { owner, repo, branch } = this.config.repository;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get file content: ${response.statusText}`);
    }

    const data = await response.json();
    return atob(data.content.replace(/\n/g, ''));
  }

  // Analyze individual file for improvements
  private async analyzeFile(filePath: string, content: string): Promise<EnhancementProposal[]> {
    const proposals: EnhancementProposal[] = [];

    // Simple analysis patterns - in production, use AI for deeper analysis
    if (content.includes('console.log') && !filePath.includes('debug')) {
      proposals.push({
        id: `remove-console-${Date.now()}`,
        title: `Remove console.log statements from ${filePath}`,
        description: 'Remove debugging console.log statements for production readiness',
        files: [{
          path: filePath,
          content: content.replace(/console\.log\([^)]*\);?\n?/g, ''),
          operation: 'update'
        }],
        rationale: 'Console.log statements should be removed in production code for performance and security',
        estimatedImpact: 'low',
        category: 'refactor'
      });
    }

    // Check for missing error handling
    if (content.includes('await ') && !content.includes('try {')) {
      proposals.push({
        id: `add-error-handling-${Date.now()}`,
        title: `Add error handling to ${filePath}`,
        description: 'Add try-catch blocks around async operations',
        files: [{
          path: filePath,
          content: this.addErrorHandling(content),
          operation: 'update'
        }],
        rationale: 'Async operations should be wrapped in error handling for better reliability',
        estimatedImpact: 'medium',
        category: 'bug-fix'
      });
    }

    return proposals;
  }

  // Add basic error handling to async functions
  private addErrorHandling(content: string): string {
    // Simple pattern matching - in production, use AST parsing
    return content.replace(
      /const (\w+) = async \([^)]*\) => {([^}]+)}/g,
      'const $1 = async ($2) => {\n  try {$3\n  } catch (error) {\n    console.error("Error in $1:", error);\n    throw error;\n  }\n}'
    );
  }

  // Create enhancement branch and commit changes
  async implementEnhancement(proposal: EnhancementProposal, autoCommit = false): Promise<string | null> {
    if (!this.config) return null;

    try {
      const branchName = `${this.config.branchPrefix}/${proposal.id}`;
      
      // Create new branch
      await this.createBranch(branchName);
      
      // Apply file changes
      for (const file of proposal.files) {
        await this.updateFile(file.path, file.content, branchName);
      }

      // Create commit
      const commitMessage = `${proposal.title}\n\n${proposal.description}\n\nRationale: ${proposal.rationale}\nImpact: ${proposal.estimatedImpact}\nCategory: ${proposal.category}\n\n[Eliza Autonomous Enhancement]`;
      
      if (autoCommit || this.config.autoCommit) {
        await this.createCommit(branchName, commitMessage);
        console.log(`✅ Enhancement committed to branch: ${branchName}`);
        return branchName;
      }

      return branchName;
    } catch (error) {
      console.error('Failed to implement enhancement:', error);
      return null;
    }
  }

  // Create new branch
  private async createBranch(branchName: string) {
    if (!this.config) throw new Error('GitHub integration not initialized');
    
    const token = apiKeyManager.getKey('githubPersonalAccessToken');
    const { owner, repo, branch } = this.config.repository;

    // Get current branch SHA
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    const refData = await refResponse.json();
    const baseSha = refData.object.sha;

    // Create new branch
    await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    });
  }

  // Update file in repository
  private async updateFile(filePath: string, content: string, branch: string) {
    if (!this.config) throw new Error('GitHub integration not initialized');
    
    const token = apiKeyManager.getKey('githubPersonalAccessToken');
    const { owner, repo } = this.config.repository;

    // Get current file SHA if it exists
    let fileSha: string | undefined;
    try {
      const fileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        fileSha = fileData.sha;
      }
    } catch (error) {
      // File doesn't exist, will be created
    }

    // Update or create file
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update ${filePath} [Eliza Enhancement]`,
        content: btoa(content),
        sha: fileSha,
        branch: branch,
      }),
    });
  }

  // Create commit
  private async createCommit(branch: string, message: string) {
    // The file updates already create commits in GitHub API
    // This method could be extended for more complex commit operations
    console.log(`Commit created on branch ${branch}: ${message}`);
  }

  // Check if GitHub integration is available
  isAvailable(): boolean {
    return !!apiKeyManager.getKey('githubPersonalAccessToken') && !!this.config;
  }

  // Get current configuration
  getConfiguration(): GitHubConfig | null {
    return this.config;
  }
}

export const githubIntegration = new GitHubIntegration();