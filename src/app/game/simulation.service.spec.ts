/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SimulationService } from './simulation.service';

describe('Service: Simulation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimulationService]
    });
  });

  it('should ...', inject([SimulationService], (service: SimulationService) => {
    expect(service).toBeTruthy();
  }));
});