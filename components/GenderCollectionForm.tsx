'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Users, ArrowRight, AlertCircle } from 'lucide-react';

interface GenderCollectionFormProps {
  groupName?: string;
  category?: string;
  prolificPid?: string;
  onSubmit: (gender: string) => void;
}

export default function GenderCollectionForm({
  groupName,
  category,
  prolificPid,
  onSubmit
}: GenderCollectionFormProps) {
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGender) {
      setIsSubmitting(true);
      onSubmit(selectedGender);
    }
  };

  const getRequiredGender = () => {
    if (category === 'All Male') return 'male';
    if (category === 'All Female') return 'female';
    return null;
  };

  const requiredGender = getRequiredGender();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-600"
            >
              <Users className="h-8 w-8 text-white" />
            </motion.div>

            {groupName && (
              <Badge variant="outline" className="mx-auto mb-4 px-4 py-2 border-primary-200 bg-primary-50 text-primary-700">
                {groupName}
              </Badge>
            )}

            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to the Experiment
            </CardTitle>

            <CardDescription className="text-gray-600 text-base">
              Please provide your gender information to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Prolific ID Display */}
            {prolificPid && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Prolific ID:</strong> {prolificPid}
                </p>
              </div>
            )}

            {/* Category Info */}
            {category && category !== 'No Gender' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">
                      Group Requirement
                    </h4>
                    <p className="text-sm text-purple-800">
                      {category === 'All Male' && 'This experiment requires male participants only.'}
                      {category === 'All Female' && 'This experiment requires female participants only.'}
                      {category === 'Mixed' && 'This experiment requires a mixed-gender group.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gender Selection Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">
                  What is your gender? <span className="text-red-500">*</span>
                </Label>

                <div className="space-y-2">
                  {/* Male Option */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGender('MALE')}
                    disabled={requiredGender === 'female'}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${selectedGender === 'MALE'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                      ${requiredGender === 'female'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Male</span>
                      {selectedGender === 'MALE' && (
                        <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </motion.button>

                  {/* Female Option */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGender('FEMALE')}
                    disabled={requiredGender === 'male'}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${selectedGender === 'FEMALE'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                      ${requiredGender === 'male'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Female</span>
                      {selectedGender === 'FEMALE' && (
                        <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </motion.button>

                  {/* Other Option - Only for Mixed or No Gender */}
                  {(!requiredGender || category === 'Mixed') && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedGender('OTHER')}
                      className={`
                        w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer
                        ${selectedGender === 'OTHER'
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Other / Prefer not to say</span>
                        {selectedGender === 'OTHER' && (
                          <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!selectedGender || isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    Continue to Waiting Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Privacy Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Privacy:</strong> Your gender information is used only for group formation 
                and is linked to your Prolific ID for this experiment. This data is not shared 
                with third parties.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
