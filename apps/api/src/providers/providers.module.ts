import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AD_PROVIDER } from './ad.provider.js';
import { FakeAdProvider } from './fake-ad.provider.js';
import { IMAGE_PROVIDER } from './image.provider.js';
import { LibraryImageProvider } from './library-image.provider.js';
import { NARRATIVE_PROVIDER } from './narrative.provider.js';
import { TemplateNarrativeProvider } from './template-narrative.provider.js';
import { AiNarrativeProvider } from './ai-narrative.provider.js';
import { AiImageProvider } from './ai-image.provider.js';
import { GOOGLE_IDENTITY_PROVIDER } from './google.provider.js';
import { MockGoogleProvider } from './mock-google.provider.js';
import { GoogleOAuthProvider } from './google-oauth.provider.js';
import { IMAGE_STORAGE } from './storage.provider.js';
import { S3StorageProvider } from './s3-storage.provider.js';
import { ASSESSMENT_REPOSITORY } from '../repositories/assessment.repository.js';
import { MemoryAssessmentRepository } from '../repositories/memory-assessment.repository.js';
import { PrismaAssessmentRepository } from '../repositories/prisma-assessment.repository.js';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    MemoryAssessmentRepository,
    PrismaAssessmentRepository,
    {
      provide: ASSESSMENT_REPOSITORY,
      inject: [MemoryAssessmentRepository, PrismaAssessmentRepository],
      useFactory: (memory: MemoryAssessmentRepository, prisma: PrismaAssessmentRepository) =>
        process.env.DATABASE_URL && process.env.USE_IN_MEMORY_DB !== 'true' ? prisma : memory,
    },
    { provide: AD_PROVIDER, useClass: FakeAdProvider },
    TemplateNarrativeProvider,
    LibraryImageProvider,
    AiNarrativeProvider,
    AiImageProvider,
    { provide: NARRATIVE_PROVIDER, useExisting: AiNarrativeProvider },
    { provide: IMAGE_PROVIDER, useExisting: AiImageProvider },
    MockGoogleProvider,
    GoogleOAuthProvider,
    S3StorageProvider,
    { provide: IMAGE_STORAGE, useExisting: S3StorageProvider },
    {
      provide: GOOGLE_IDENTITY_PROVIDER,
      inject: [MockGoogleProvider, GoogleOAuthProvider],
      useFactory: (mock: MockGoogleProvider, oauth: GoogleOAuthProvider) => process.env.GOOGLE_CLIENT_ID && process.env.USE_MOCK_GOOGLE !== 'true' ? oauth : mock,
    },
  ],
  exports: [ASSESSMENT_REPOSITORY, AD_PROVIDER, NARRATIVE_PROVIDER, IMAGE_PROVIDER, GOOGLE_IDENTITY_PROVIDER, IMAGE_STORAGE],
})
export class ProvidersModule {}
