/**
 * State management for the rocket scene
 * Handles transitions between different animation states
 */

export enum SceneState {
  IDLE = 'idle',
  PREPARING = 'preparing',
  LAUNCHING = 'launching',
  RESETTING = 'resetting'
}

export class RocketState {
  private currentState: SceneState = SceneState.IDLE;
  private listeners: Map<string, Set<() => void>> = new Map();

  /**
   * Get the current state
   */
  public get state(): SceneState {
    return this.currentState;
  }

  /**
   * Check if a specific action can be performed in the current state
   */
  public canShoot(): boolean {
    return this.currentState === SceneState.IDLE;
  }

  public canInteract(): boolean {
    return this.currentState === SceneState.IDLE;
  }

  public isAnimating(): boolean {
    return this.currentState === SceneState.LAUNCHING ||
           this.currentState === SceneState.PREPARING;
  }

  /**
   * Transition to a new state if the transition is valid
   */
  public transition(to: SceneState): boolean {
    // Define valid state transitions
    const validTransitions: Record<SceneState, SceneState[]> = {
      [SceneState.IDLE]: [SceneState.PREPARING],
      [SceneState.PREPARING]: [SceneState.LAUNCHING, SceneState.IDLE],
      [SceneState.LAUNCHING]: [SceneState.RESETTING],
      [SceneState.RESETTING]: [SceneState.IDLE]
    };

    // Check if the transition is valid
    const allowedStates = validTransitions[this.currentState];
    if (!allowedStates || !allowedStates.includes(to)) {
      console.warn(
        `Invalid state transition attempted: ${this.currentState} -> ${to}`
      );
      return false;
    }

    // Perform the transition
    const from = this.currentState;
    this.currentState = to;

    console.log(`State transition: ${from} -> ${to}`);

    // Emit state change event
    this.emit('stateChange');
    this.emit(to);

    return true;
  }

  /**
   * Force reset to idle state (use with caution)
   */
  public forceReset(): void {
    const from = this.currentState;
    this.currentState = SceneState.IDLE;
    console.log(`Force reset from ${from} to IDLE`);
    this.emit('stateChange');
    this.emit(SceneState.IDLE);
  }

  /**
   * Event system for state changes
   */
  public on(event: SceneState | 'stateChange', callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: SceneState | 'stateChange', callback: () => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: SceneState | 'stateChange'): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * Debug helper
   */
  public debugState(): string {
    return `Current State: ${this.currentState}, Can Shoot: ${this.canShoot()}, Is Animating: ${this.isAnimating()}`;
  }
}