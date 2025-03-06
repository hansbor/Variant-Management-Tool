import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Settings {
  editor_config: {
    enable_tinymce: boolean;
  };
  sku_config: {
    prefix: string;
    sequence_counter: number;
    enable_auto_generation: boolean;
  };
  gs1_config: {
    company_prefix: string;
    location_reference: string;
    sequence_counter: number;
    enable_auto_generation: boolean;
    barcode_format: 'GTIN-13' | 'GTIN-14' | 'SSCC';
  };
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    editor_config: {
      enable_tinymce: false
    },
    sku_config: {
      prefix: '',
      sequence_counter: 0,
      enable_auto_generation: false
    },
    gs1_config: {
      company_prefix: '',
      location_reference: '',
      sequence_counter: 0,
      enable_auto_generation: false,
      barcode_format: 'GTIN-13'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      setSettings({
        editor_config: settingsMap?.editor_config || { enable_tinymce: false },
        sku_config: settingsMap?.sku_config || {
          prefix: '',
          sequence_counter: 0,
          enable_auto_generation: false
        },
        gs1_config: settingsMap?.gs1_config || {
          company_prefix: '',
          location_reference: '',
          sequence_counter: 0,
          enable_auto_generation: false,
          barcode_format: 'GTIN-13'
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key: keyof Settings, value: any) => {
    try {
      setLoading(true);

      // For GS1 settings, ensure sequence counter is preserved
      let updatedValue = value;
      if (key === 'gs1_config') {
        const { data: currentSettings } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'gs1_config')
          .single();

        updatedValue = {
          ...value,
          sequence_counter: currentSettings?.value?.sequence_counter || 0
        };
      }

      // Update local state with the correct value
      setSettings(prev => {
        if (key === 'gs1_config') {
          return {
            ...prev,
            [key]: updatedValue
          };
        }
        return {
          ...prev,
          [key]: value
        };
      });
      
      // First check if the setting exists
      const { data: existingData } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .single();

      // If it exists, update it. Otherwise, insert it.
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: existingData?.id,
          key,
          value: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    fetchSettings
  };
};
