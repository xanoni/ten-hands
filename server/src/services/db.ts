import low, { AdapterSync } from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { v4 as uuidv4 } from "uuid";

class Database {
  private static _instance: Database;
  private db = null;
  // Create Singleton by private constructor
  private constructor() {
    const adapter: AdapterSync = new FileSync("../db.json");
    this.db = low(adapter);
    this.db
      .defaults({
        projects: [],
        commands: [] // Different from commands in side a project
      })
      .write();
  }

  // Return singleton instance
  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  public get projects(): IProject[] {
    const projects = this.db.get("projects").value();
    return projects;
  }

  public addProject(project: IProject) {
    // Create IDs for commands submitted
    const commands = project.commands.map(command => {
      return {
        _id: uuidv4(),
        ...command
      };
    });
    const projectWithUpdatedCommands = {
      ...project,
      commands
    };
    const result = this.db
      .get("projects")
      .push({ _id: uuidv4(), ...projectWithUpdatedCommands })
      .write();
    return result;
  }

  public deleteProject(projectId: string) {
    const result = this.db
      .get("projects")
      .remove({ _id: projectId })
      .write();
    return result;
  }

  public getProject(id: string): IProject {
    const project = this.db
      .get("projects")
      .find({ _id: id })
      .value();
    return project;
  }

  public getProjectCommand(projectId: string, commandId: string) {
    const command = this.db
      .get("projects")
      .find({ _id: projectId })
      .get("commands")
      .find({ _id: commandId })
      .value();
    return command;
  }
}

export default Database.getInstance();
