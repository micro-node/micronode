/**
 * NodeJS service launcher
 *
 */

import ServiceManager from './service-manager';


export function launchPath(path, cb){

  return new ServiceManager(path, cb);
}


export function launch(name){


}