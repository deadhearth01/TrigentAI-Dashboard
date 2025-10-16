// Local storage utilities for offline mode

export class LocalStorageDB {
  private static instance: LocalStorageDB;
  private idCounter = 0; // Counter for additional uniqueness
  
  private constructor() {}
  
  static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  // Generate unique ID using timestamp + counter + random string
  private generateId(): string {
    this.idCounter = (this.idCounter + 1) % 1000; // Reset counter after 1000
    return `${Date.now()}-${this.idCounter}-${Math.random().toString(36).substring(2, 10)}`;
  }

  // Users
  async getUsers(): Promise<any[]> {
    const users = localStorage.getItem('trigent_users');
    return users ? JSON.parse(users) : [];
  }

  async createUser(user: any): Promise<any> {
    const users = await this.getUsers();
    const newUser = { ...user, id: this.generateId(), created_at: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('trigent_users', JSON.stringify(users));
    return newUser;
  }

  // Uploads
  async getUploads(userId: string): Promise<any[]> {
    const uploads = localStorage.getItem('trigent_uploads');
    const allUploads = uploads ? JSON.parse(uploads) : [];
    return allUploads.filter((upload: any) => upload.user_id === userId);
  }

  async createUpload(upload: any): Promise<any> {
    const uploads = localStorage.getItem('trigent_uploads');
    const allUploads = uploads ? JSON.parse(uploads) : [];
    const newUpload = { 
      ...upload, 
      id: this.generateId(), 
      uploaded_at: new Date().toISOString() 
    };
    allUploads.push(newUpload);
    localStorage.setItem('trigent_uploads', JSON.stringify(allUploads));
    return newUpload;
  }

  // Reports
  async getReports(userId: string): Promise<any[]> {
    const reports = localStorage.getItem('trigent_reports');
    const allReports = reports ? JSON.parse(reports) : [];
    return allReports.filter((report: any) => report.user_id === userId);
  }

  async createReport(report: any): Promise<any> {
    const reports = localStorage.getItem('trigent_reports');
    const allReports = reports ? JSON.parse(reports) : [];
    const newReport = { 
      ...report, 
      id: this.generateId(), 
      created_at: new Date().toISOString() 
    };
    allReports.push(newReport);
    localStorage.setItem('trigent_reports', JSON.stringify(allReports));
    return newReport;
  }

  // Automations
  async getAutomations(userId: string): Promise<any[]> {
    const automations = localStorage.getItem('trigent_automations');
    const allAutomations = automations ? JSON.parse(automations) : [];
    return allAutomations.filter((automation: any) => automation.user_id === userId);
  }

  async createAutomation(automation: any): Promise<any> {
    const automations = localStorage.getItem('trigent_automations');
    const allAutomations = automations ? JSON.parse(automations) : [];
    const newAutomation = { 
      ...automation, 
      id: this.generateId(), 
      created_at: new Date().toISOString(),
      status: 'inactive'
    };
    allAutomations.push(newAutomation);
    localStorage.setItem('trigent_automations', JSON.stringify(allAutomations));
    return newAutomation;
  }

  async updateAutomation(id: string, updates: any): Promise<any> {
    const automations = localStorage.getItem('trigent_automations');
    const allAutomations = automations ? JSON.parse(automations) : [];
    const index = allAutomations.findIndex((automation: any) => automation.id === id);
    if (index !== -1) {
      allAutomations[index] = { ...allAutomations[index], ...updates };
      localStorage.setItem('trigent_automations', JSON.stringify(allAutomations));
      return allAutomations[index];
    }
    return null;
  }

  // Social Posts
  async getSocialPosts(userId: string): Promise<any[]> {
    const posts = localStorage.getItem('trigent_social_posts');
    const allPosts = posts ? JSON.parse(posts) : [];
    return allPosts.filter((post: any) => post.user_id === userId);
  }

  async createSocialPost(post: any): Promise<any> {
    const posts = localStorage.getItem('trigent_social_posts');
    const allPosts = posts ? JSON.parse(posts) : [];
    const newPost = { 
      ...post, 
      id: this.generateId(), 
      created_at: new Date().toISOString() 
    };
    allPosts.push(newPost);
    localStorage.setItem('trigent_social_posts', JSON.stringify(allPosts));
    return newPost;
  }

  // Growth Data
  async getGrowthData(userId: string): Promise<any> {
    const growthData = localStorage.getItem('trigent_growth_data');
    const allGrowthData = growthData ? JSON.parse(growthData) : [];
    const userGrowthData = allGrowthData.find((data: any) => data.user_id === userId);
    
    if (!userGrowthData) {
      // Return default growth data
      return {
        user_id: userId,
        target: 40,
        current_growth: 25.8,
        strategies: [
          { id: '1', name: 'Expand into new markets', status: 'active', progress: 60 },
          { id: '2', name: 'Increase digital marketing campaigns', status: 'planning', progress: 0 },
          { id: '3', name: 'Introduce referral programs', status: 'active', progress: 30 },
          { id: '4', name: 'Product diversification', status: 'research', progress: 15 }
        ],
        market_reach: {
          local: 45,
          regional: 30,
          national: 20,
          international: 5
        },
        recommendations: [
          'Focus on Tier-2 cities for market expansion',
          'Invest in influencer marketing for better reach',
          'Optimize conversion funnel to improve sales',
          'Implement customer retention strategies'
        ],
        updated_at: new Date().toISOString()
      };
    }
    
    return userGrowthData;
  }

  async updateGrowthData(userId: string, data: any): Promise<any> {
    const growthData = localStorage.getItem('trigent_growth_data');
    const allGrowthData = growthData ? JSON.parse(growthData) : [];
    const index = allGrowthData.findIndex((item: any) => item.user_id === userId);
    
    const updatedData = { 
      ...data, 
      user_id: userId, 
      updated_at: new Date().toISOString() 
    };
    
    if (index !== -1) {
      allGrowthData[index] = updatedData;
    } else {
      allGrowthData.push(updatedData);
    }
    
    localStorage.setItem('trigent_growth_data', JSON.stringify(allGrowthData));
    return updatedData;
  }
}

export const localDB = LocalStorageDB.getInstance();
