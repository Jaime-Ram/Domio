/**
 * POS Integration Factory
 * Creates the appropriate POS integration instance based on provider
 */

import type { POSProvider, POSIntegration } from './types'
import { LightspeedIntegration } from './lightspeed'
// Future imports:
// import { ToastIntegration } from './toast'
// import { SquareIntegration } from './square'
// import { UntillIntegration } from './untill'

import type { POSIntegrationInterface } from './types'

export class POSIntegrationFactory {
  /**
   * Create a POS integration instance
   */
  static create(integration: POSIntegration): POSIntegrationInterface {
    const config = {
      apiKey: integration.api_key,
      accessToken: integration.access_token,
      refreshToken: integration.refresh_token,
      locationId: integration.location_id,
    }

    switch (integration.provider) {
      case 'lightspeed':
        return new LightspeedIntegration({
          accessToken: integration.access_token || '',
          refreshToken: integration.refresh_token,
          locationId: integration.location_id || '',
        })

      // Future implementations:
      // case 'toast':
      //   return new ToastIntegration(config)
      // case 'square':
      //   return new SquareIntegration(config)
      // case 'untill':
      //   return new UntillIntegration(config)

      default:
        throw new Error(`Unsupported POS provider: ${integration.provider}`)
    }
  }

  /**
   * Get provider configuration
   */
  static getProviderConfig(provider: POSProvider) {
    const configs: Record<POSProvider, { name: string; auth_type: 'oauth' | 'api_key'; supports_webhooks: boolean }> = {
      lightspeed: {
        name: 'Lightspeed',
        auth_type: 'oauth',
        supports_webhooks: true,
      },
      toast: {
        name: 'Toast',
        auth_type: 'oauth',
        supports_webhooks: true,
      },
      square: {
        name: 'Square',
        auth_type: 'oauth',
        supports_webhooks: true,
      },
      untill: {
        name: 'Untill',
        auth_type: 'api_key',
        supports_webhooks: false,
      },
      touchbistro: {
        name: 'TouchBistro',
        auth_type: 'api_key',
        supports_webhooks: false,
      },
      resengo: {
        name: 'Resengo',
        auth_type: 'api_key',
        supports_webhooks: false,
      },
      zenchef: {
        name: 'Zenchef',
        auth_type: 'api_key',
        supports_webhooks: false,
      },
      formitable: {
        name: 'Formitable',
        auth_type: 'api_key',
        supports_webhooks: false,
      },
    }

    return configs[provider]
  }
}




