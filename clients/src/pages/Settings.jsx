import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

const endpoint = window.wpamData.settings_endpoint;
const nonce = window.wpamData.nonce;

export default function Settings() {}
